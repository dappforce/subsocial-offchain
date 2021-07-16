import { log } from '../postges-logger'
import { runQuery, Tables, Period, isPeriod } from '../utils'

const createQuery = (period?: string) => `
  SELECT count(*) FROM df.activities
  WHERE event = any(:event::df.action[]) ${period ? `AND date > (now() - interval '${period} days')`: ''}`

export async function getActivityCountByEvent(eventName: string, period: string) {
  const params = { event: eventName.split(',') };
  const query = createQuery(period)
  const allTimeQuery = createQuery()

export async function getActivityCountByEvent(eventName: string, period: Period) {
  if (!isPeriod(period)) return

  const events = eventName.split(',')

  let table: Tables = 'activities'
  if (events[0] === 'Dripped') table = 'token_drops'

  const params = { event: events }

  const query = createQuery(period, table)

  try {
    const res = await runQuery(query, params)
    const allTimeRes = await runQuery(allTimeQuery, params)

    return { countByPeriod: res.rows[0]?.count, totalCount: allTimeRes.rows[0]?.count };
  } catch (err) {
    log.error('Failed to get activity count by event:', err.stack)
    throw err
  }
}
