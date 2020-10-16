import { newLogger, isDef } from "@subsocial/utils"
import { pg } from '../connections/connect-postgres'
import { logSuccess, logError } from '../postgres/postges-logger'
import { Activity } from '@subsocial/types'

const log = newLogger('ExpressOffchainQuery')

type ActivitiesParams = {
  account: string,
  offset?: number,
  limit?: number
}

type Table = 'news_feed' | 'notifications'

const getActivitiesOrCountFrom = async <T extends Activity[] | number>(
    table: Table,
    what: 'data' | 'count',
    { account, offset, limit }: ActivitiesParams
  ): Promise<T> => {
  const isCountQuery = what === 'count'
  const queryData = isCountQuery ? 'COUNT(*)' : 'DISTINCT *'
  let otherQueryParts = isCountQuery ? '' : 'ORDER BY date DESC'
  const details = table === 'notifications' ? 'AND aggregated = true' : ''

  if (isDef(offset)) {
    otherQueryParts += '\nOFFSET $2'
  }

  if (isDef(limit)) {
    otherQueryParts += '\nLIMIT $3'
  }

  const query = `
    SELECT ${queryData} 
    FROM df.activities
    WHERE id IN (
      SELECT activity_id
      FROM df.${table}
      WHERE account = $1 ${details}
    )
    ${otherQueryParts}`;
  
  const params = [ account, offset, limit ].filter(isDef);
  log.debug(`SQL params: ${params}`);

  const msg = `${what} from ${table}`

  try {
    const data = await pg.query(query, params)
    logSuccess(msg, `by account: ${account}`)

    return isCountQuery ? data.rows.pop().count : data.rows as T;
  } catch (err) {
    logError(msg, `by account: ${account}`, err.stack);
    throw err.stack
  }
}

const getActivitiesFrom = (from: Table, params: ActivitiesParams) => getActivitiesOrCountFrom<Activity[]>(from, 'data', params)
const getCountFrom = (from: Table, params: ActivitiesParams) => getActivitiesOrCountFrom<number>(from, 'count', params)

export type GetActivityFn = (params: ActivitiesParams) => Promise<Activity[]>
export const getFeedData: GetActivityFn = (params) => getActivitiesFrom('news_feed', params)
export const getNotificationsData: GetActivityFn = (params) => getActivitiesFrom('notifications', params)

export type GetCountFn = (account: string) => Promise<number>
export const getFeedCount: GetCountFn = (account) => getCountFrom('news_feed', { account })
export const getNotificationsCount: GetCountFn = (account) => getCountFrom('notifications', { account })