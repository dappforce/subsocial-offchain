import * as events from 'events'
import { log } from './ws';
import BN from 'bn.js';

events.EventEmitter.defaultMaxListeners = 0;

// FIXME: replace this with type in src/express-api/email/utils.ts that should be exported
export type Type = 'notification' | 'feed'

export const eventEmitter = new events.EventEmitter()

export const EVENT_UPDATE_NOTIFICATIONS_COUNTER = 'event.UpdateNotificationsCounter'

export const EVENT_SEND_FOR_TELEGRAM = 'event.SendForTelegram'

export function informClientAboutUnreadNotifications (account: string, unreadCount: number) {
  log.debug(`Inform client about unread notifications account ${account}, unread count ${unreadCount}`)
  eventEmitter.emit(EVENT_UPDATE_NOTIFICATIONS_COUNTER, account, unreadCount);
}

export function informTelegramClientAboutNotifOrFeed (account: string, whom: string, blockNumber: BN, eventIndex: number, type: Type) {
  log.debug(`Inform client about notififiction or feed account ${whom}`)
  eventEmitter.emit(EVENT_SEND_FOR_TELEGRAM, account, whom, blockNumber, eventIndex, type);
}
