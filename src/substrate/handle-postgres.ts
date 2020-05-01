import { SubstrateEvent, EventHandlerFn } from './types'
import * as handlers from '../postgres/event-handlers/index'
import { newLogger } from '@subsocial/utils'

export const handleEventForPostgres: EventHandlerFn = async (event: SubstrateEvent) => {
  const handle: EventHandlerFn = handlers[`on${event.eventName}`]
  if (typeof handle === 'function') {
    try {
      await handle(event)
    } catch (err) {
      log.error('Failed to handle a Substrate event for Postgres')
      return err
    }
  }
}

const log = newLogger(handleEventForPostgres.name)
