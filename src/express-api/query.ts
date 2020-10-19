import { newLogger } from "@subsocial/utils"
import { pg } from '../connections/connect-postgres'
import { Activity } from '@subsocial/types'

const log = newLogger('ExpressOffchainQuery')

type ActivitiesParams = {
  account: string,
  offset: number,
  limit: number
}

type Table = 'news_feed' | 'notifications' | 'activities'

const createFeedOrNotifQuery = (table: Table) => 
  `SELECT DISTINCT * 
    FROM df.activities
    WHERE id IN (
      SELECT activity_id
      FROM df.${table}
      WHERE account = $1 AND aggregated = true
    )
    ORDER BY date DESC
    OFFSET $2
    LIMIT $3`

const createFeedOrNotifCountQuery = (table: Table) => 
  `SELECT COUNT(*)
    FROM df.activities
    WHERE id IN (
      SELECT activity_id
      FROM df.${table}
      WHERE account = $1
    )`

const createActivityQuery = () => 
  `SELECT DISTINCT * 
    FROM df.activities
    WHERE account = $1
    ORDER BY date DESC
    OFFSET $2
    LIMIT $3`

const createActivityCountQuery = () => 
  `SELECT COUNT(*)
    FROM df.activities
    WHERE account = $1`

const getQuery = async (
    query: string,
    params: any[],
    errorMsg: string
  ): Promise<any> => {
  try {
    const data = await pg.query(query, params)
    return data.rows
  } catch (err) {
    log.error(errorMsg, err.stack);
    throw err.stack
  }
}

const getActivitiesFrom = (table: Table, { account, offset, limit }: ActivitiesParams): Promise<Activity[]> => getQuery(
  table === 'activities'
    ? createActivityQuery()
    : createFeedOrNotifQuery(table),
  [ account, offset, limit ],
  `Failed to load to activities from ${table} by account ${account}`)

const getCountFrom = async (table: Table, account: string) => {
  const data = await getQuery(
    table === 'activities'
      ? createActivityCountQuery()
      : createFeedOrNotifCountQuery(table),
    [ account ],
    `Failed to count activities from ${table} by account ${account}`)

  return data.pop().count
}

export type GetActivityFn = (params: ActivitiesParams) => Promise<Activity[]>
export const getFeedData: GetActivityFn = (params) => getActivitiesFrom('news_feed', params)
export const getNotificationsData: GetActivityFn = (params) => getActivitiesFrom('notifications', params)
export const getActivitiesData: GetActivityFn = (params) => getActivitiesFrom('activities', params)

export type GetCountFn = (account: string) => Promise<number>
export const getFeedCount: GetCountFn = (account) => getCountFrom('news_feed', account)
export const getNotificationsCount: GetCountFn = (account) => getCountFrom('notifications', account)
export const getActivitiesCount: GetCountFn = (params) => getCountFrom('activities', params)
