import { informClientAboutUnreadNotifications } from '../../express-api/events';
import { log } from '../postges-logger';
import { getCountOfUnreadNotifications } from '../selects/getCountOfUnreadNotifications';
import { runQuery } from '../utils';

const query = `
  INSERT INTO df.notifications_counter
    (account, last_read_block_number, last_read_event_index, unread_count)
  VALUES (:account, 0, NULL, 0)
  ON CONFLICT (account) DO UPDATE
  SET unread_count = (
    SELECT DISTINCT COUNT(*)
    FROM df.activities
    WHERE aggregated = true AND (block_number, event_index) IN (
      SELECT block_number, event_index
      FROM df.notifications
      WHERE account = :account AND block_number > (
        SELECT last_read_block_number
        FROM df.notifications_counter
        WHERE account = :account
      )
    )
  )`

export async function updateCountOfUnreadNotifications(account: string) {
  try {
    const res = await runQuery(query, { account })
    log.debug(`Successfully updated unread notifications by account ${account}. Query result: ${res.rows}`)
    const currentUnreadCount = await getCountOfUnreadNotifications(account)
    informClientAboutUnreadNotifications(account, currentUnreadCount);
  } catch (err) {
    log.error(`Failed to update unread notifications by account ${account}. Error: %s`, err.stack);
    throw err
  }
}