import { SubstrateEvent, EventHandlerFn } from './types'
import * as handlers from '../postgres/event-handlers/index'

export const handleEventForPostgres = async (event: SubstrateEvent): Promise<Error | void> => {
  const handle: EventHandlerFn = handlers[`on${event.eventName}`]
  if (typeof handle === 'function') {
    try {
      await handle(event)
    } catch (err) {
      console.error('Failed to handle a Substrate event for Postgres:', err.stack)
      return err
    }
  }
}
