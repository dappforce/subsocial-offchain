import { GetActivityFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent } from './common'
import { EventsName } from '@subsocial/types'

const postEvents: EventsName[] = [ 'PostCreated' ]

export const getPostActivitiesData: GetActivityFn = (params) =>
  getActivitiesByEvent({ ...params, events: postEvents })

export const getPostActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events: postEvents })