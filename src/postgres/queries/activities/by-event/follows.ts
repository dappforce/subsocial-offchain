import { GetActivitiesFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent } from './common'
import { EventsName } from '@subsocial/types'

const events: EventsName[] = [ 'SpaceFollowed', 'AccountFollowed' ]

export const getFollowActivitiesData: GetActivitiesFn = (params) =>
  getActivitiesByEvent({ ...params, events })

export const getFollowActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events })
