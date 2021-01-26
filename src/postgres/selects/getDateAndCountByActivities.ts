import { log } from '../postges-logger';
import { runQuery, action } from '../utils';

const query = `
  SELECT to_char(date, 'YYYY-MM-DD') as format_date, count(*) FROM df.activities
  WHERE event = :event
  GROUP BY format_date`

export async function getDateAndCountByActivities(eventName: action) {
  console.log(eventName)
  const params = { event: eventName };

  try {
    const res = await runQuery(query, params)
    console.log(res.rows)
    return res.rows;
  } catch (err) {
    log.error('Failed to get date and count by event:', err.stack)
    throw err
  }
}