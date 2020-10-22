import { GetActivitiesFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent } from './common'
import { EventsName } from '@subsocial/types'

const events: EventsName[] = [ 'SpaceCreated' ]

export const getSpaceActivitiesData: GetActivitiesFn = (params) =>
  getActivitiesByEvent({ ...params, events })

export const getSpaceActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events })
