import * as WebSocket from 'ws'
import { newLogger, isEmptyArray } from '@subsocial/utils';
import { EVENT_SEND_FOR_TELEGRAM, eventEmitter, Type } from './events';
import { offchainTWSPort } from '../env';
import BN from 'bn.js';
import { getActivity } from '../postgres/selects/getActivity';
import { Activity as OldActivity } from '@subsocial/types'
import { getChatIdByAccount } from '../postgres/selects/getChatIdByAccount';

require('dotenv').config()

export type Activity = Omit<OldActivity, 'id'> & {
	block_number: string,
	event_index: number
}

export const log = newLogger('Telegram WS')

export let wss: WebSocket.Server

export const resolveWebSocketServer = () => {
	if (!wss) {
		const port = parseInt(offchainTWSPort)
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

export function startNotificationsServerForTelegram() {
	resolveWebSocketServer()
	wss.on('connection', (ws: WebSocket) => {
		ws.on('message', async (data: string) => {
			log.debug('Received a message with data:', data)
		})

		eventEmitter.addListener(EVENT_SEND_FOR_TELEGRAM, async (account: string, whom: string, blockNumber: BN, eventIndex: number, type: Type) => {
			const activity = await getActivity(account, blockNumber, eventIndex)
			const chats = await getChatIdByAccount(whom)

			if (!isEmptyArray(chats) && activity) {
				Promise.all([
					chats.map((chat) => ws.send(JSON.stringify({ activity, chatId: chat.chat_id, type })))
				])
			}
		})

		ws.on('close', (ws: WebSocket) => {
			log.debug('Closed web socket server:', ws)
			eventEmitter.removeAllListeners(EVENT_SEND_FOR_TELEGRAM)
		})
	})

	wss.on('close', () => {
		log.info('Closed web socket server')
	})
}
