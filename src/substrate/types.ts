import { EventData } from '@polkadot/types/generic/Event'
import BN from 'bn.js';

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

export const HandlerResultErrorInPostgres = (err: Error) =>
  ({ PostgresError: err })

export const HandlerResultErrorInElastic = (err: Error) =>
  ({ ElasticError: err })

export type EventHandlerFn = (event: SubstrateEvent) => Promise<HandlerResult>
