import { Event } from '@polkadot/types/interfaces';
import { SubstrateId } from '@subsocial/types/substrate/interfaces/utils'
import { bnToHex } from '@polkadot/util'
import { newLogger } from '@subsocial/utils';
import { SubstrateEvent } from './types';
import { PostId } from '@subsocial/types/substrate/interfaces';

//import { types } from 'pg'

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

export function encodeStructIds (ids: SubstrateId[]) {
  try {
    return ids.map(encodeStructId)
  } catch (err) {
    log.error('Failed to encode struct ids:', err)
    return []
  }
}

/**
 * Convert a number to its shortened hex representation.
 * Example: '0x000012ab' -> '12ab'
 */
export function encodeStructId (id: SubstrateId): string {
  //return bnToHex(id).split('x')[1].replace(/(0+)/, '')
  return id.toString()
}

export function encodeStructHexId (id: SubstrateId): string {
  return bnToHex(id).split('x')[1].replace(/(0+)/, '')
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
