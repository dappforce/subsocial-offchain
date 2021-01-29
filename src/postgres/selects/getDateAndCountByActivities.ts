import { log } from '../postges-logger';
import { runQuery } from '../utils';

const createQuery = (period: string) => `
  SELECT to_char(date, 'YYYY-MM-DD') as format_date, count(*) FROM df.activities
  WHERE event = any(:event::df.action[]) AND date > (now() - interval '${period} days')
  GROUP BY format_date`


export async function getDateAndCountByActivities(eventName: string, period: string) {
  const params = { event: eventName.split(',') }
  const query = createQuery(period)

  try {
    const res = await runQuery(query, params)
    return res.rows;
  } catch (err) {
    log.error('Failed to get date and count by event:', err.stack)
    throw err
  }
}