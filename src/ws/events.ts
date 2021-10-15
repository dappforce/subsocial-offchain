import { EventEmitter} from 'events'
import BN from 'bn.js';
import { newLogger } from '@subsocial/utils';
import { ParsedEntity } from '../substrate/types';

EventEmitter.defaultMaxListeners = 4;

// FIXME: replace this with type in src/express-api/email/utils.ts that should be exported
export type Type = 'notification' | 'feed'

export const events = {
	updateNotifCounter: 'event.UpdateNotificationsCounter',
	sendActivity: 'event.SendActivity',
	sendReport: 'event.SendReport'
}

export const eventEmitter = new EventEmitter()

const log = newLogger('Event emitter')

export function informClientAboutUnreadNotifications (account: string, unreadCount: number) {
	log.debug(`Inform client about unread notifications account ${account}, unread count ${unreadCount}`)
	eventEmitter.emit(events.updateNotifCounter, account, unreadCount);
}
  
export function informTelegramClientAboutNotifOrFeed (account: string, whom: string, blockNumber: BN, eventIndex: number, type: Type) {
	log.debug(`Inform client about notififiction or feed account ${whom}`)
	eventEmitter.emit(events.sendActivity, account, whom, blockNumber, eventIndex, type);
}

export type ReportInfo = {
	who: string,
	entity: ParsedEntity,
	scopeId: string
}

export function informTelegramClientAboutReport (info: ReportInfo) {
	log.debug(`Inform client about notififiction or feed account ${info.who}`)
	eventEmitter.emit(events.sendReport, info);
}