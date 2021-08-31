import { Activity } from '@subsocial/types'
import { execPgQuery } from './utils'
import { ActivitiesParams, GetActivitiesFn, GetCountFn } from './types'

export type ActivityTable = 'news_feed' | 'notifications'

const buildPageQuery = (table: ActivityTable) =>
  `SELECT DISTINCT *
    FROM df.activities
    WHERE aggregated = true AND (block_number, event_index) IN (
      SELECT block_number, event_index
      FROM df.${table}
      WHERE account = $1
    )
    ORDER BY date DESC
    OFFSET $2
    LIMIT $3`

const buildCountQuery = (table: ActivityTable) =>
  `SELECT COUNT(*)
    FROM df.activities
    WHERE aggregated = true AND (block_number, event_index) IN (
      SELECT block_number, event_index
      FROM df.${table}
      WHERE account = $1
    )`

const queryPage = (table: ActivityTable, params: ActivitiesParams): Promise<Activity[]> => {
  const { account, offset, limit } = params
  return execPgQuery(
    buildPageQuery(table),
    [ account, offset, limit ],
    `Failed to load to activities in ${table} by account ${account}`
  )
}

const queryCount = async (table: ActivityTable, account: string) => {
  const data = await execPgQuery(
    buildCountQuery(table),
    [ account ],
    `Failed to count activities in ${table} by account ${account}`
  )
  return data.pop().count
}

export const getFeedData: GetActivitiesFn = (params) => queryPage('news_feed', params)

export const getFeedCount: GetCountFn = (account) => queryCount('news_feed', account)

export const getNotificationsData: GetActivitiesFn = (params) => queryPage('notifications', params)

export const getNotificationsCount: GetCountFn = (account) => queryCount('notifications', account)