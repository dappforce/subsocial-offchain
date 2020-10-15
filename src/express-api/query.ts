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

type FromDB = 'news_feed' | 'notifications'

const getActivitiesOrCountFrom = async <T extends Activity[] | number>(
  db: FromDB,
  what: 'data' | 'count', { account, offset, limit }: ActivitiesParams): Promise<T> => {
  const isCountQuery = what === 'count'
  const queryData = isCountQuery ? 'COUNT(id)' : 'DISTINCT *'
  let otherQueryParams = isCountQuery ? '' : 'ORDER BY date DESC'
  const details = db === 'notifications' ? 'AND aggregated = true' : ''

  if (isDef(offset)) {
    otherQueryParams += '\nOFFSET $2'
  }

  if (isDef(limit)) {
    otherQueryParams += '\nLIMIT $3'
  }

  const query = `
    SELECT ${queryData} 
    FROM df.activities
    WHERE id IN (
      SELECT activity_id
      FROM df.${db}
      WHERE account = $1 ${details})
    ${otherQueryParams}`;
  
  const params = [ account, offset, limit ].filter(isDef);
  log.debug(`SQL params: ${params}`);

  const msg = `${what} from ${db}`

  try {
    const data = await pg.query(query, params)
    logSuccess(msg, `by account: ${account}`)

    return isCountQuery ? data.rows.pop().count : data.rows as T;
  } catch (err) {
    logError(msg, `by account: ${account}`, err.stack);
    throw err.stack
  }
}

const getActivitiesFrom = (from: FromDB, params: ActivitiesParams) => getActivitiesOrCountFrom<Activity[]>(from, 'data', params)

const getCountFrom = (from: FromDB, params: ActivitiesParams) => getActivitiesOrCountFrom<number>(from, 'count', params)

export const getFeedData = (params: ActivitiesParams) => getActivitiesFrom('news_feed', params)

export const getNotificationsData = (params: ActivitiesParams) => getActivitiesFrom('notifications', params)

export const getFeedCount = (account: string) => getCountFrom('news_feed', { account })

export const getNotificationsCount = (account: string) => getCountFrom('notifications', { account })