import { getCountOfUnreadNotifications } from '../notifications';
import { informClientAboutUnreadNotifications } from '../../express-api/events';
import { log } from '../postges-logger';
import { pg } from '../../connections/postgres';

export const updateCountOfUnreadNotifications = async (account: string) => {
  const query = `
    INSERT INTO df.notifications_counter 
      (account, last_read_event_index, last_read_block_number, unread_count)
    VALUES ($1, NULL, NULL, 1)
    ON CONFLICT (account) DO UPDATE
    SET unread_count = (
      SELECT DISTINCT COUNT(*)
      FROM df.activities
      WHERE aggregated = true AND (block_number, event_index) IN ( 
        SELECT block_number, event_index
        FROM df.notifications
        WHERE account = $1 AND block_number > (
          SELECT last_read_block_number
          FROM df.notifications_counter
          WHERE account = $1
        )
      )
    )`

  try {
    const res = await pg.query(query, [ account ])
    log.debug(`Successfully updated unread notifications by account ${account}. Query result: ${res.rows}`)
    const currentUnreadCount = await getCountOfUnreadNotifications(account)
    informClientAboutUnreadNotifications(account, currentUnreadCount);
  } catch (err) {
    log.error(`Failed to update unread notifications by account ${account}. Error: %s`, err.stack);
    throw err
  }
}