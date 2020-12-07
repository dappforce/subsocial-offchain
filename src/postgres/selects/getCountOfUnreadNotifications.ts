import { log } from '../postges-logger';
import { runQuery } from '../utils';
import { IQueryParams } from '../types/getCountOfUnreadNotifications.queries';

const query = `
  SELECT unread_count
  FROM df.notifications_counter
  WHERE account = :account`

export async function getCountOfUnreadNotifications(account: string) {
  try {
    const res = await runQuery<IQueryParams>(query, { account })
    log.debug(`Found ${res.rows[0]?.unread_count} unread notifications by account ${account}`)
    return res.rows[0] ? res.rows[0].unread_count as number : 0;
  } catch (err) {
    log.error(`Failed to get a count of unread notifications by account ${account}. Error: %s`, err.stack);
    throw err
  }
}