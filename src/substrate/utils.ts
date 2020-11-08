import { Option } from '@polkadot/types'
import { Event } from '@polkadot/types/interfaces'
import { PostId } from '@subsocial/types/substrate/interfaces'
import { SubstrateId } from '@subsocial/types/substrate/interfaces/utils'
import { newLogger } from '@subsocial/utils'
import { SubstrateEvent } from './types'

require('dotenv').config()

const log = newLogger('Substrate Utils')

const ANY_EVENT = '*'

const parseListOfVals = (vals: string): Set<string> => {
  if (vals) {
    return new Set(vals.split(',').map(x => x.trim()))
  }
  return new Set([ ANY_EVENT ])
}

// Get Substrate event filters from .env
const eventsFilterSections = parseListOfVals(process.env.SUBSTRATE_EVENT_SECTIONS)

export const eventsFilterMethods = parseListOfVals(process.env.SUBSTRATE_EVENT_METHODS)

export function shouldHandleEvent (event: Event): boolean {
  if (!event || !event.section || !event.method) {
    return false
  }

  return eventsFilterMethods.has(ANY_EVENT) || (
    eventsFilterSections.has(event.section.toString()) && 
    eventsFilterMethods.has(event.method.toString())
  )
}

/** Convert id of Substrate struct to `bigint`. */
export function encodeStructId (id: SubstrateId): bigint {
  return BigInt(id.toString())
}

/** Convert ids of Substrate structs to `bigint`s. */
export function encodeStructIds (ids: SubstrateId[]): bigint[] {
  try {
    return ids.map(encodeStructId)
  } catch (err) {
    log.error('Failed to encode struct ids:', err)
    return []
  }
}

export enum VirtualEvents {
  CommentCreated = 'CommentCreated',
  CommentShared = 'CommentShared',
  CommentDeleted = 'CommentDeleted',
  CommentReactionCreated = 'CommentReactionCreated',
  CommentReplyCreated = 'CommentReplyCreated'
}

export const parsePostEvent = ({ data }: SubstrateEvent) => {
  return {
    author: data[0].toString(),
    postId: data[1] as PostId
  }
}

export const parseCommentEvent = (eventAction: SubstrateEvent) => {
  const { author, postId: commentId } = parsePostEvent(eventAction)
  return { author, commentId }
}

export function stringifyOption(opt: Option<any>): string {
  return opt.unwrapOr(undefined)?.toString()
}
