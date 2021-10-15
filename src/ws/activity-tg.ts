import * as WebSocket from 'ws'
import { newLogger, isEmptyArray } from '@subsocial/utils';
import { events, eventEmitter, Type } from './events';
import { socketPorts } from '../env';
import BN from 'bn.js';
import { getActivity } from '../postgres/selects/getActivity';
import { getChatDataByAccount } from '../postgres/selects/getChatIdByAccount';
import { ChatIdType } from './types';
import { Activity } from '@subsocial/types';

require('dotenv').config()

export const log = newLogger('Telegram WS')

export let wss: WebSocket.Server

export const resolveWebSocketServer = () => {
	if (!wss) {
		const port = parseInt(socketPorts.activity)
		wss = new WebSocket.Server({ port }, () => {
			log.info(`Started web socket server for Notifications Counter on port ${port}`)
		})
	}
	return wss
}

export function sendActivity(account: string, activity: Activity, chatId: number, client: WebSocket) {
	const msg = JSON.stringify({ activity, chatId })
	client.send(msg)
	log.debug(`Message '${msg}' sent to account`, account)
}

export function startActivityWs() {
	resolveWebSocketServer()
	wss.on('connection', (ws: WebSocket) => {
		ws.on('message', async (data: string) => {
			log.debug('Received a message with data:', data)
		})

		eventEmitter.addListener(events.sendActivity, async (account: string, whom: string, blockNumber: BN, eventIndex: number, type: Type) => {
			const activity = await getActivity(account, blockNumber, eventIndex)
			const chats: ChatIdType[] = await getChatDataByAccount(whom)

			if (!isEmptyArray(chats) && activity) {
				const chatIds = chats.map((chat) => chat.chat_id)
				ws.send(JSON.stringify({ activity, chatIds, type }))
			}
		})

		ws.on('close', (ws: WebSocket) => {
			log.debug('Closed web socket server:', ws)
			eventEmitter.removeAllListeners(events.sendActivity)
		})
	})

	wss.on('close', () => {
		log.info('Closed web socket server')
	})
}
