import { EventData } from '@polkadot/types/generic/Event'
import BN from 'bn.js';

type CommonDbState = {
  lastBlock: number
  lastError?: string
}

export type OffchainState = {
  Postgres: CommonDbState,
  Elastic: CommonDbState
}

export type SubstrateEvent = {
  eventName: string,
  data: EventData,
  blockHeight: BN,
  processPostgres: boolean
  processElastic: boolean
}

export type HandlerResult = {
  PostgresError?: Error
  ElasticError?: Error
}

export const HandlerResultOK = {}

export type EventHandlerFn = (event: SubstrateEvent) => Promise<HandlerResult>
