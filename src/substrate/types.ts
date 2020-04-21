import { EventData } from '@polkadot/types/generic/Event'
import BN from 'bn.js';

export type SubstrateEvent = {
  eventName: string,
  data: EventData,
  blockHeight: BN
}

export type OffchainState = {
  lastBlock?: number
}

export const defaultOffchainState = (): OffchainState => ({
  lastBlock: undefined
})