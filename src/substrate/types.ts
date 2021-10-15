import { GenericEventData } from '@polkadot/types';
import BN from 'bn.js';

export type CommonDbState = {
  lastBlock: number
  lastError?: string
}

export type OffchainState = {
  postgres: CommonDbState
  elastic: CommonDbState
}

export type SubstrateEvent = {
  eventName: string
  data: GenericEventData
  blockNumber: BN
  eventIndex: number
}

export type EntityKind = 'Space'
  | 'Post'
  | 'Account'
  | 'Content'

export type ParsedEntity = {
  entityKind: EntityKind,
  entityId: string
}

export type EventHandlerFn = (event: SubstrateEvent) => Promise<void>
