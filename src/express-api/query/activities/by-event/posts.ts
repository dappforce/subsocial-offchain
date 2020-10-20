import { GetActivityFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent, EventsName } from './common'

const postEvents: EventsName[] = [ 'PostCreated', 'PostShared' ]

export const getPostActivitiesData: GetActivityFn = (params) =>
  getActivitiesByEvent({ ...params, events: postEvents })

export const getPostActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events: postEvents })