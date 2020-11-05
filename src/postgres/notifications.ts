import { pg } from '../connections/postgres';
import { log } from './postges-logger';
import { informClientAboutUnreadNotifications } from '../express-api/events';
import { ActivitiesParamsWithAccount } from './queries/types';
import { newPgError } from './utils';

export const insertNotificationForOwner = async ({blockNumber, eventIndex, account }: ActivitiesParamsWithAccount) => {
  const query = `
    INSERT INTO df.notifications
      VALUES($1, $2, $3) 
    RETURNING *`

  const params = [ account, blockNumber, eventIndex ]

  try {
    await pg.query(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, insertNotificationForOwner)
  }
}

export type AggCountProps = {
  eventName: string,
  account: string,
  post_id: bigint
}

export const getAggregationCount = async (props: AggCountProps) => {
  const { eventName, post_id, account } = props;
  const params = [ account, eventName, post_id ];

  const query = `
    SELECT count(distinct account)
    FROM df.activities
    WHERE account <> $1
      AND event = $2
      AND post_id = $3`

  try {
    const res = await pg.query(query, params)
    log.info(`Get ${res.rows[0].count} distinct activities by post id: ${post_id}`)
    return res.rows[0].count as number;
  } catch (err) {
    log.error('Failed to getAggregationCount:', err.stack)
    throw err
  }
}

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

export const getCountOfUnreadNotifications = async (account: string) => {
  const query = `
    SELECT unread_count
    FROM df.notifications_counter
    WHERE account = $1`

  try {
    const res = await pg.query(query, [ account ])
    log.debug(`Found ${res.rows[0].unread_count} unread notifications by account ${account}`)
    return res.rows[0].unread_count as number;
  } catch (err) {
    log.error(`Failed to get a count of unread notifications by account ${account}. Error: %s`, err.stack);
    throw err
  }
}

export const markAllNotifsAsRead = async (account: string) => {
  const query = `
    WITH last_activity AS (
      SELECT block_number, event_index
      FROM df.notification
      WHERE account = $1
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
    WHERE account = $1`

  try {
    const data = await pg.query(query, [ account ])
    informClientAboutUnreadNotifications(account, 0)
    log.debug(`Marked all notifications as read by account: ${account}`)
    return data.rowCount
  } catch (err) {
    log.error(`Failed to mark all notifications as read by account: ${account}`, err.stack)
    throw err
  }
}
