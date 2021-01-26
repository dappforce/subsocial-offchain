import { log } from '../postges-logger';
import { runQuery, action } from '../utils';

const query = `
  SELECT count(*) FROM df.activities
  WHERE event = :event`

export async function getActivityCountByEvent(eventName: action) {
  const params = { event: eventName };

  try {
    const res = await runQuery(query, params)
    console.log(res.rows)
    return res.rows[0]?.count;
  } catch (err) {
    log.error('Failed to get activity count by event:', err.stack)
    throw err
  }
}