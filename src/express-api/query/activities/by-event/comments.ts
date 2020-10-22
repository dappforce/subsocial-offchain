import { GetActivityFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent } from './common'
import { EventsName } from '@subsocial/types'

const commentEvents: EventsName[] = [ 'CommentCreated', 'CommentReplyCreated']

export const getCommentActivitiesData: GetActivityFn = (params) =>
  getActivitiesByEvent({ ...params, events: commentEvents })

export const getCommentActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events: commentEvents })