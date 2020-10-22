import { GetActivitiesFn, GetCountFn } from '../../types'
import { getActivitiesByEvent, getActivitiesCountByEvent } from './common'
import { EventsName } from '@subsocial/types'

const events: EventsName[] = [ 'PostCreated' ]

export const getPostActivitiesData: GetActivitiesFn = (params) =>
  getActivitiesByEvent({ ...params, events })

export const getPostActivitiesCount: GetCountFn = (account) =>
  getActivitiesCountByEvent({ account, events })
