import * as events from 'events'
import { log } from './ws';


export const eventEmitter = new events.EventEmitter()

export const EVENT_UPDATE_NOTIFICATIONS_COUNTER = 'event.UpdateNotificationsCounter'

export function informClientAboutUnreadNotifications (account: string, unreadCount: number) {
  log.debug(`Inform client about unread notifications account ${account}, unread count ${unreadCount}`)
  eventEmitter.emit(EVENT_UPDATE_NOTIFICATIONS_COUNTER, account, unreadCount);
}
