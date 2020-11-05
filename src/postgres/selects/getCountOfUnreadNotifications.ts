import { pg } from '../../connections/postgres';
import { log } from '../postges-logger';

const query = `
  SELECT unread_count
  FROM df.notifications_counter
  WHERE account = $1`

export async function getCountOfUnreadNotifications(account: string) {
  try {
    const res = await pg.query(query, [ account ])
    log.debug(`Found ${res.rows[0].unread_count} unread notifications by account ${account}`)
    return res.rows[0].unread_count as number;
  } catch (err) {
    log.error(`Failed to get a count of unread notifications by account ${account}. Error: %s`, err.stack);
    throw err
  }
}