import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK } from './types'
import * as pghandlers from '../postgres/event-handlers/index'
import * as elastichandlers from '../search/event-handlers/index'
import { newLogger } from '@subsocial/utils'

export const DispatchForDb: EventHandlerFn = async (event: SubstrateEvent): Promise<HandlerResult> => {
  const { eventName } = event
  const handlePostgres: EventHandlerFn | undefined = pghandlers[`on${eventName}`]
  const handleElastic: EventHandlerFn | undefined = elastichandlers[`on${eventName}`]
  
  let PostgresError: Error
  let ElasticError: Error

  if (typeof handlePostgres === 'function') {
    try {
      handlePostgres(event)
    } catch (err) {
      log.error('Failed to PG')
      PostgresError = err
    }
  } 
  
  if (typeof handleElastic === 'function') {
    try {
      handleElastic(event)
    } catch (err) {
      log.error('Failed to Elastic')
      ElasticError = err
    }
  }
  
  if (!handlePostgres && !handleElastic) {
    log.debug(`No handlers defined for Substrate event '${eventName}'`)
    return HandlerResultOK
  }

  return {
    PostgresError,
    ElasticError
  }
}

const log = newLogger(DispatchForDb.name)
