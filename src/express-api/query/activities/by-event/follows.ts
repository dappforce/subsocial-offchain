import { GetActivityFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent } from './common'
import { EventsName } from '@subsocial/types'

const followEvents: EventsName[] = [ 'SpaceFollowed', 'AccountFollowed' ]

export const getFollowActivitiesData: GetActivityFn = (params) =>
  getActivitiesByEvent({ ...params, events: followEvents })

export const getFollowActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events: followEvents })