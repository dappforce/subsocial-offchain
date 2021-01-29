import { log } from '../postges-logger';
import { runQuery } from '../utils';
import dayjs from 'dayjs';

const query = `
  SELECT  count(*) FROM df.activities
  WHERE event = any(:event::df.action[]) and to_char(date, 'YYYY-MM-DD') = :date`

export async function getActivityCountForToday(eventName: string) {
  const params = { event: eventName.split(','), date: dayjs(new Date()).format("YYYY-MM-DD") };

  try {
    const res = await runQuery(query, params)
    return res.rows[0]?.count || 0;
  } catch (err) {
    log.error('Failed to get activity count by event:', err.stack)
    throw err
  }
}