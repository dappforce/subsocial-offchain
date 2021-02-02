import { log } from '../postges-logger';
import { runQuery } from '../utils';

const createQuery = (period: string) => `
  SELECT count(*) FROM df.activities
  WHERE event = any(:event::df.action[]) AND date > (now() - interval '${period} days')`

export async function getActivityCountByEvent(eventName: string, period: string) {
  const params = { event: eventName.split(',') };
  const query = createQuery(period)

  try {
    const res = await runQuery(query, params)
    return res.rows[0]?.count;
  } catch (err) {
    log.error('Failed to get activity count by event:', err.stack)
    throw err
  }
}