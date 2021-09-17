import { log } from '../postges-logger'
import { runQuery, Tables, Period, isPeriod } from '../utils'

const createQuery = (table: string, period?: string) => {
  const isActivities = table === 'activities'
  const hasMorePart = period ? 'and' : ''

  const event = isActivities ? `event = any(:event::df.action[]) ${hasMorePart}` : ''
  const whereQueryPart = `${event} ${period ? `date > (now() - interval '${period} days')`: ''}`

  return `
    SELECT count(*) FROM df.${table}
    ${!period && !isActivities ? '' : `where ${whereQueryPart}`}`
}

export async function getActivityCountByEvent(eventName: string, period: Period) {
  if (!isPeriod(period)) return undefined

  const events = eventName.split(',')

  let table: Tables = 'activities'
  if (events[0] === 'Dripped') table = 'token_drops'

  const params = { event: events }

  const query = createQuery(table, period)
  const allTimeQuery = createQuery(table)

  try {
    const res = await runQuery(query, params)
    const allTimeRes = await runQuery(allTimeQuery, params)

    return { countByPeriod: res.rows[0]?.count, totalCount: allTimeRes.rows[0]?.count };
  } catch (err) {
    log.error('Failed to get activity count by event:', err.stack)
    throw err
  }
}
