import { GetActivityFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent, EventsName } from './common'

const reactionEvents: EventsName[] = [ 'CommentReactionCreated', 'PostReactionCreated' ]

export const getReactionActivitiesData: GetActivityFn = (params) =>
  getActivitiesByEvent({ ...params, events: reactionEvents })

export const getReactionActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events: reactionEvents })