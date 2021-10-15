import { Option } from '@polkadot/types'
import { Event } from '@polkadot/types/interfaces'
import { newLogger } from '@subsocial/utils'
import { EntityKind, ParsedEntity, SubstrateEvent } from './types'
import BN from 'bn.js';
import { resolveSubsocialApi } from '../connections/subsocial';
import dayjs from 'dayjs'
import { EntityId } from '@subsocial/types/substrate/interfaces';

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
export function encodeStructId (id: string): bigint {
  return BigInt(id)
}

/** Convert ids of Substrate structs to `bigint`s. */
export function encodeStructIds (ids: string[]): bigint[] {
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
    postId: data[1].toString()
  }
}

export const parseCommentEvent = (eventAction: SubstrateEvent) => {
  const { author, postId: commentId } = parsePostEvent(eventAction)
  return { author, commentId }
}

export function stringifyOption(opt: Option<any>): string {
  return opt.unwrapOr(undefined)?.toString()
}

export const blockNumberToApproxDate = async (eventBlock: BN) => {
  const { substrate } = await resolveSubsocialApi()
  const api = await substrate.api

  const blockTime = api.consts.timestamp?.minimumPeriod.muln(2).toNumber()
  const currentTimestamp = await api.query.timestamp.now()
  const block = await api.rpc.chain.getBlock()

  const lastBlockNumber = block.block.header.number.unwrap()
  const result = currentTimestamp.sub(lastBlockNumber.sub(new BN(eventBlock)).muln(blockTime))

  return dayjs(result.toNumber())
}

export const parseEntity = (entityEnum: EntityId): ParsedEntity => {
  return {
    entityKind: entityEnum.type as EntityKind,
    entityId: entityEnum.value.toString()
  }
}

type ActivityIds = {
  followingId: string | null,
  postId: bigint| null,
  spaceId: bigint | null
}

export const parseActivityFromEntity = ({ entityId, entityKind }: ParsedEntity): ActivityIds => {
  const ids = {
    followingId: null,
    postId: null,
    spaceId: null
  }
  
  switch(entityKind) {
    case 'Account': {
      ids.followingId = entityId
      break
    }
    case 'Post': {
      ids.postId = encodeStructId(entityId)
      break
    }
    case 'Space': {
      ids.spaceId = encodeStructId(entityId)
      break
    }
  }

  return ids
}