import { log } from '../postges-logger';
import { runQuery, Tables } from '../utils';

const createQuery = (period: string, table: Tables) => {
  const event = table === 'activities' ? 'event = any(:event::df.action[]) AND' : ''

  return `SELECT to_char(date, 'YYYY-MM-DD') as format_date, count(*) FROM df.${table}
    WHERE ${event} date > (now() - interval '${period} days')
    GROUP BY format_date`
}

export async function getDateAndCountByActivities(eventName: string, period: string) {
  const events = eventName.split(',')

  let table: Tables = 'activities'
  if (events[0] === 'Dripped')
    table = 'token_drops'

  const params = { event: events }
  const query = createQuery(period, table)

  try {
    const res = await runQuery(query, params)
    return res.rows;
  } catch (err) {
    log.error('Failed to get date and count by event:', err.stack)
    throw err
  }
}