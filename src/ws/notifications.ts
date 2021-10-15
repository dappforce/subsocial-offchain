import * as WebSocket from 'ws'
import { newLogger } from '@subsocial/utils'
import { getCountOfUnreadNotifications } from '../postgres/selects/getCountOfUnreadNotifications'
import { SessionCall, ReadAllMessage } from '../postgres/types/sessionKey';
import { markAllNotifsAsRead } from '../postgres/updates/markAllNotifsAsRead';
import { eventEmitter, events } from './events';
import { socketPorts } from '../env';
require('dotenv').config()

export const log = newLogger('Notif. Counter WS')

export let wss: WebSocket.Server

export const resolveWebSocketServer = () => {
	if (!wss) {
		const port = parseInt(socketPorts.unreadCount)
		wss = new WebSocket.Server({ port }, () => {
			log.info(`Started web socket server for Notifications Counter on port ${port}`)
		})
	}
	return wss
}

export const wsClients: Record<string, WebSocket> = {}

export function sendUnreadCount(account: string, count: number, client: WebSocket) {
	const msg = count.toString()
	client.send(msg)
	log.debug(`Message '${msg}' sent to account`, account)
}

export function startUnreadCountWs() {
	const wss = resolveWebSocketServer()
	wss.on('connection', (ws: WebSocket) => {

		ws.on('message', async (data: string) => {
			log.debug('Received a message with data:', data)
			try {
				const dataParsed = JSON.parse(data) as SessionCall<ReadAllMessage>
				await markAllNotifsAsRead(dataParsed)
			} catch {
				wsClients[data] = ws
				const unreadCount = await getCountOfUnreadNotifications(data)
				if(!unreadCount) return

				sendUnreadCount(data, unreadCount, wsClients[data])
			}
		})

		ws.on('close', (ws: WebSocket) => {
			log.debug('Closed web socket server:', ws)
		})
	})

	wss.on('close', () => {
		log.info('Closed web socket server')
		eventEmitter.removeAllListeners(events.updateNotifCounter)
	})
}

eventEmitter.addListener(events.updateNotifCounter, (account: string, unreadCount: number) => {
	const client = wsClients[account]
	if (!client || client.readyState !== WebSocket.OPEN) return

	sendUnreadCount(account, unreadCount, client)
})