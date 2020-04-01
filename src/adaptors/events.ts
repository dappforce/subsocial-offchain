import * as events from 'events'
import { EventData } from '@polkadot/types/type/Event';
import BN from 'bn.js';

export const eventEmitter = new events.EventEmitter();
export const EVENT_UPDATE_NOTIFICATIONS_COUNTER = 'eventUpdateNotificationsCounter'

export type EventAction = {
  eventName: string,
  data: EventData,
  heightBlock: BN
}

export type AggCountProps = {
  eventName: string,
  account: string,
  post_id: string
}
