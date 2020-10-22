import { ActivitiesParams } from '../../types'
import { Activity, EventsName } from '@subsocial/types'
import { execPgQuery } from '../../utils'
import { nonEmptyStr } from '@subsocial/utils'

type ActivitiesByEventParams = ActivitiesParams & {
  events: EventsName[]
}

type ActivitiesCountByEventParams = {
  account: string,
  events: EventsName[]
}

const buildEventsFilter = (events: EventsName[]) => {
  const eventsQuery = events
    .map((_, i) => `event = $${i + 1}`)
    .join(' OR ')

  return nonEmptyStr(eventsQuery)
    ? `(${eventsQuery}) AND`
    : ''
}
  
const createaAtivityByEventQuery = (props: ActivitiesByEventParams) => {
  const { events, account, offset, limit } = props
  let lastIndex = events.length

  const query =
    `SELECT DISTINCT * 
    FROM df.activities
    WHERE ${buildEventsFilter(events)} account = $${++lastIndex}
    ORDER BY date DESC
    OFFSET $${++lastIndex}
    LIMIT $${++lastIndex}`

  return { query, params: [ ...events, account, offset, limit ] }
}

const createActivityByEventCountQuery = ({ events, account }: ActivitiesCountByEventParams) => {
  let lastIndex = events.length

  const query =
    `SELECT COUNT(*)
    FROM df.activities
    WHERE ${buildEventsFilter(events)} account = $${++lastIndex}`

  return { query, params: [ ...events, account ] }
}

export const getActivitiesByEvent = (props: ActivitiesByEventParams): Promise<Activity[]> => {
  const { query, params } = createaAtivityByEventQuery(props)

  return execPgQuery(
    query,
    params,
    `Failed to load activities by account ${props.account}`
  )
}

export const getActivitiesCountByEvent = async (props: ActivitiesCountByEventParams): Promise<number> => {
  const { query, params } = createActivityByEventCountQuery(props)

  const data = await execPgQuery(
    query,
    params,
    `Failed to count activities by account ${props.account}`
  )

  return data.pop().count
}
