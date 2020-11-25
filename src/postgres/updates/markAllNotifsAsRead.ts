import { informClientAboutUnreadNotifications } from '../../express-api/events';
import { log } from '../postges-logger';
import { runQuery } from '../utils';

const query = `
  WITH last_activity AS (
    SELECT block_number, event_index
    FROM df.notification
    WHERE account = :account
    ORDER BY
      block_number DESC,
      event_index DESC
    LIMIT 1
  )
  UPDATE df.notifications_counter
  SET
    unread_count = 0,
    last_read_block_number = last_activity.block_number,
    last_read_event_index = last_activity.event_index
  WHERE account = :account`

export async function markAllNotifsAsRead(account: string) {
  try {
    const data = await runQuery(query, { account })
    informClientAboutUnreadNotifications(account, 0)
    log.debug(`Marked all notifications as read by account: ${account}`)
    return data.rowCount
  } catch (err) {
    log.error(`Failed to mark all notifications as read by account: ${account}`, err.stack)
    throw err
  }
}