import { log } from '../postges-logger';
import { runQuery, Tables } from '../utils';

const createQuery = (period: string, table: Tables) => {
  const event = table === 'activities' ? 'event = any(:event::df.action[]) AND' : ''

  return `SELECT count(*) FROM df.${table}
  WHERE ${event} date > (now() - interval '${period} days')`
}

export async function getActivityCountByEvent(eventName: string, period: string) {
  const events = eventName.split(',')
  
  let table: Tables = 'activities'
  if (events[0] === 'Dripped')
    table = 'token_drops'

  const params = { event: events }

  const query = createQuery(period, table)

  try {
    const res = await runQuery(query, params)
    return res.rows[0]?.count;
  } catch (err) {
    log.error('Failed to get activity count by event:', err.stack)
    throw err
  }
}