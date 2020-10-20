import { GetActivityFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent, EventsName } from './common'

const spaceEvents: EventsName[] = [ 'SpaceCreated' ]

export const getSpaceActivitiesData: GetActivityFn = (params) =>
  getActivitiesByEvent({ ...params, events: spaceEvents })

export const getSpaceActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events: spaceEvents })