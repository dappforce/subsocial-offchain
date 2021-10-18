import * as WebSocket from 'ws'
import { newLogger } from '@subsocial/utils'
import { eventEmitter, events, ReportInfo } from './events';
import { socketPorts } from '../env';
import { swapAndPop } from '../utils';

export const log = newLogger('Moderation WS')

export let wss: WebSocket.Server

export const resolveWebSocketServer = () => {
	if (!wss) {
		const port = parseInt(socketPorts.moderation)
		wss = new WebSocket.Server({ port }, () => {
			log.info(`Started web socket server for Moderation on port ${port}`)
		})
	}
	return wss
}

const wsClients: WebSocket[] = []

export function sendReport(client: WebSocket, info: ReportInfo) {
	const msg = JSON.stringify(info)
	client.send(msg)
	log.debug(`Message '${msg}' sent`)
}

export function startModerationWs() {
	const wss = resolveWebSocketServer()
	wss.on('connection', (ws: WebSocket) => {

		ws.on('open', async () => {
			log.debug('Received a message with data:', ws.url)
      wsClients.push(ws)
		})

		ws.on('close', (ws: WebSocket) => {
			log.debug('Closed web socket server:', ws)
		})
	})

	wss.on('close', () => {
		log.info('Closed web socket server')
		eventEmitter.removeAllListeners(events.sendReport)
	})
}

eventEmitter.addListener(events.sendReport, (info: ReportInfo) => {
	wsClients.forEach((client, i) => {
    if (!client || client.readyState !== WebSocket.OPEN) {
			swapAndPop(wsClients, i)
		} {
			sendReport(client, info)
		}
  })
})