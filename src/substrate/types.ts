import { EventData } from '@polkadot/types/generic/Event'
import BN from 'bn.js';

export type SubstrateEvent = {
  eventName: string,
  data: EventData,
  blockHeight: BN
}
