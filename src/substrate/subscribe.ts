import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK } from './types'
import * as handlers from './event-handlers/index'
import { newLogger } from '@subsocial/utils'

export const DispatchForDb: EventHandlerFn = async (event: SubstrateEvent): Promise<HandlerResult> => {
  const { eventName } = event
  const handle: EventHandlerFn | undefined = handlers[`on${eventName}`]
  if (typeof handle === 'function') {
    return handle(event)
  } else {
    log.debug(`No handler defined for Substrate event '${eventName}'`)
    return HandlerResultOK
  }
}

const log = newLogger(DispatchForDb.name)
