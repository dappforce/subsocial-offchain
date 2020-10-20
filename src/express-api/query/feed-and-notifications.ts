import { Activity } from '@subsocial/types'
import { getQuery } from './utils'
import { ActivitiesParams, GetActivityFn, GetCountFn } from './types'

type Table = 'news_feed' | 'notifications'

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

const getFeedOrNotifFrom = (table: Table, { account, offset, limit }: ActivitiesParams): Promise<Activity[]> => getQuery(
  createFeedOrNotifQuery(table),
  [ account, offset, limit ],
  `Failed to load to activities from ${table} by account ${account}`)

const getFeedOrNotifCountFrom = async (table: Table, account: string) => {
  const data = await getQuery(
    createFeedOrNotifCountQuery(table),
    [ account ],
    `Failed to count activities from ${table} by account ${account}`)

  return data.pop().count
}

export const getFeedData: GetActivityFn = (params) => getFeedOrNotifFrom('news_feed', params)
export const getNotificationsData: GetActivityFn = (params) => getFeedOrNotifFrom('notifications', params)

export const getFeedCount: GetCountFn = (account) => getFeedOrNotifCountFrom('news_feed', account)
export const getNotificationsCount: GetCountFn = (account) => getFeedOrNotifCountFrom('notifications', account)