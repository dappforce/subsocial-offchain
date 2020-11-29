import * as WebSocket from 'ws'
import { newLogger } from '@subsocial/utils'
import { eventEmitter, EVENT_UPDATE_NOTIFICATIONS_COUNTER } from './events'
import { getCountOfUnreadNotifications } from '../postgres/selects/getCountOfUnreadNotifications'

require('dotenv').config()

const log = newLogger('Notif. Counter WS')

const wsClients: { [account: string]: WebSocket } = {}

function sendUnreadCount (account: string, count: number) {
  const msg = '' + count
  wsClients[account].send(msg)
  log.debug(`Message '${msg}' sent to account`, account)
}

export function startNotificationsServer() {
  const port = parseInt(process.env.OFFCHAIN_WS_PORT) || 3011
  const wss = new WebSocket.Server({ port }, () => {
    log.info(`Started web socket server for Notifications Counter on port ${port}`)
  })

  wss.on('connection', (ws: WebSocket) => {

    ws.on('message', async (account: string) => {
      log.debug('Received a message from account', account)
      wsClients[account] = ws
      const unreadCount = await getCountOfUnreadNotifications(account)
      sendUnreadCount(account, unreadCount)
    })

    eventEmitter.on(EVENT_UPDATE_NOTIFICATIONS_COUNTER, (account: string, unreadCount: number) => {
      const client = wsClients[account]
      if (!client) return

      if (client.readyState !== WebSocket.OPEN) {
        delete wsClients[account]
        return
      }

      sendUnreadCount(account, unreadCount)
    })

    ws.on('close', (ws: WebSocket) => {
      log.info('Closed web socket server:', ws)
      eventEmitter.removeAllListeners(EVENT_UPDATE_NOTIFICATIONS_COUNTER)
    })
  })

  wss.on('close', () => {
    log.info('Closed web socket server')
  })
}