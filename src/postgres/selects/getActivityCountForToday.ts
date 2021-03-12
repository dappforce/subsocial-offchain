import { log } from '../postges-logger';
import { runQuery, Tables } from '../utils';
import dayjs from 'dayjs';

const createQuery = (table: Tables) => {
  const event = table === 'activities' ? 'event = any(:event::df.action[]) AND' : ''

  return `SELECT  count(*) FROM df.${table}
    WHERE ${event} to_char(date, 'YYYY-MM-DD') = :date`
}

export async function getActivityCountForToday(eventName: string) {
  const events = eventName.split(',')

  let table: Tables = 'activities'
  if (events[0] === 'Dripped')
    table = 'token_drops'

  const params = { event: events, date: dayjs(new Date()).format("YYYY-MM-DD") };
  const query = createQuery(table)
  try {
    const res = await runQuery(query, params)
    return res.rows[0]?.count || 0;
  } catch (err) {
    log.error('Failed to get activity count by event:', err.stack)
    throw err
  }
}