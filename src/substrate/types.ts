import { EventData } from '@polkadot/types/generic/Event'
import BN from 'bn.js';

type CommonDbState = {
  lastBlock: number
  lastError?: string
}

export type OffchainState = {
  Postgres: CommonDbState
  Elastic: CommonDbState
}

export type SubstrateEvent = {
  eventName: string
  data: EventData
  blockHeight: BN
}

export type HandlerResult = Error | undefined

export const HandlerResultOK = undefined

export type EventHandlerFn = (event: SubstrateEvent) => Promise<HandlerResult>
