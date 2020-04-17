import * as events from 'events'

export const eventEmitter = new events.EventEmitter();
export const EVENT_UPDATE_NOTIFICATIONS_COUNTER = 'event.UpdateNotificationsCounter'

export function informClientAboutUnreadNotifications (account: string, unreadCount: number) {
  eventEmitter.emit(EVENT_UPDATE_NOTIFICATIONS_COUNTER, account, unreadCount);
}