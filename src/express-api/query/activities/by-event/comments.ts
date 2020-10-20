import { GetActivityFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent, EventsName } from './common'

const commentEvents: EventsName[] = [ 'CommentCreated', 'CommentShared', 'CommentReplyCreated']

export const getCommentActivitiesData: GetActivityFn = (params) =>
  getActivitiesByEvent({ ...params, events: commentEvents })

export const getCommentActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events: commentEvents })