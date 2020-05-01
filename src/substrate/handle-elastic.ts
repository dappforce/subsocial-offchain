import { SubstrateEvent, EventHandlerFn } from './types'
import * as handlers from '../search/event-handlers/index'
import { newLogger } from '@subsocial/utils'

export const handleEventForElastic: EventHandlerFn = async (event: SubstrateEvent) => {
  const handle: EventHandlerFn = handlers[`on${event.eventName}`]
  if (typeof handle === 'function') {
    try {
      await handle(event)
    } catch (err) {
      log.error('Failed to handle a Substrate event for Elastic')
      return err
    }
  }
}

const log = newLogger(handleEventForElastic.name)
