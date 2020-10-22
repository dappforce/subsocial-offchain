import { GetActivitiesFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent } from './common'
import { EventsName } from '@subsocial/types'

const events: EventsName[] = [ 'CommentCreated', 'CommentReplyCreated']

export const getCommentActivitiesData: GetActivitiesFn = (params) =>
  getActivitiesByEvent({ ...params, events })

export const getCommentActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events })
