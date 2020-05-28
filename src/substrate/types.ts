import { EventData } from '@polkadot/types/generic/Event'
import BN from 'bn.js';

type CommonDbState = {
  lastBlock: number
  lastError?: string
}

export type OffchainState = {
  postgres: CommonDbState
  elastic: CommonDbState
}

export type SubstrateEvent = {
  eventName: string
  data: EventData
  blockNumber: BN
}

export type EventHandlerFn = (event: SubstrateEvent) => Promise<void>
