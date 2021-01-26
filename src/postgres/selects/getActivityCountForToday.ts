import { log } from '../postges-logger';
import { runQuery, action } from '../utils';
import dayjs from 'dayjs';

const query = `
  SELECT  count(*) FROM df.activities
  WHERE event = :event and to_char(date, 'YYYY-MM-DD') = :date`

export async function getActivityCountForToday(eventName: action) {
  const params = { event: eventName, date: dayjs(new Date()).format("YYYY-MM-DD") };

  try {
    const res = await runQuery(query, params)
    console.log(res.rows)
    return res.rows[0]?.count || 0;
  } catch (err) {
    log.error('Failed to get activity count by event:', err.stack)
    throw err
  }
}