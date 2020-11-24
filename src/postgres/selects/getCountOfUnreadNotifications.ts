import { sql } from '@pgtyped/query';
import { log } from '../postges-logger';
import { runQuery } from '../utils';

const query = sql`
  SELECT unread_count
  FROM df.notifications_counter
  WHERE account = $account`

export async function getCountOfUnreadNotifications(account: string) {
  try {
    const res = await runQuery(query, { account })
    log.debug(`Found ${res[0].unread_count} unread notifications by account ${account}`)
    return res[0].unread_count as number;
  } catch (err) {
    log.error(`Failed to get a count of unread notifications by account ${account}. Error: %s`, err.stack);
    throw err
  }
}