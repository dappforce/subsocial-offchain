import { SubstrateEvent, EventHandlerFn } from './types'
import * as handlers from '../postgres/event-handlers/index'
import { newLogger } from '@subsocial/utils'

export const handleEventForPostgres = async (event: SubstrateEvent): Promise<Error | void> => {
  const handle: EventHandlerFn = await handlers[`on${event.eventName}`]
  if (typeof handle === 'function') {
    try {
      await handle(event)
      log.debug(`Successfully pocessed event ${event.eventName} at block ${event.blockNumber}, event index ${event.eventIndex}`)
    } catch (err) {
      log.error('Failed to handle a Substrate event for Postgres:', err)
      return err
    }
  }
}

const log = newLogger('handleEventForPostgres')
