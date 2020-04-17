import { pool } from '../adaptors/connect-postgres';
import { log, insertActivityLog, insertActivityLogError } from './postges-logger';
import { eventEmitter, EVENT_UPDATE_NOTIFICATIONS_COUNTER, AggCountProps } from '../adaptors/events';

export const insertNotificationForOwner = async (id: number, account: string) => {
  const query = `
      INSERT INTO df.notifications
        VALUES($1, $2) 
      RETURNING *`;
  const params = [ account, id ];
  try {
    await pool.query(query, params)
    insertActivityLog('owner')
    await updateUnreadNotifications(account)
  } catch (err) {
    insertActivityLogError('owner', err.stack)
  }
}

export const getAggregationCount = async (props: AggCountProps) => {
  const { eventName, post_id, account } = props;
  const params = [ account, eventName, post_id ];

  const query = `
  SELECT count(distinct account)
    FROM df.activities
    WHERE account <> $1
      AND event = $2
      AND post_id = $3`;
  try {
    const res = await pool.query(query, params)
    log.info(`Get ${res.rows[0].count} distinct activities by post id: ${post_id}`)
    return res.rows[0].count as number;
  } catch (err) {
    log.error('Failed to getAggregationCount:', err.stack)
    return 0;
  }
}

export const updateUnreadNotifications = async (account: string) => {
  const query = `
    INSERT INTO df.notifications_counter 
      (account, last_read_activity_id, unread_count)
    VALUES ($1, 0, 1)
    ON CONFLICT (account) DO UPDATE
    SET unread_count = (
      SELECT DISTINCT COUNT(*)
      FROM df.activities
      WHERE aggregated = true AND id IN ( 
        SELECT activity_id
        FROM df.notifications
        WHERE account = $1 AND activity_id > (
          SELECT last_read_activity_id
          FROM df.notifications_counter
          WHERE account = $1
        )
      )
    )
  `

  const params = [ account ]
  try {
    const res = await pool.query(query, params)
    log.debug(`Successfully updated unread notifications by account ${account}. Query result: ${res.rows}`)
    const currentUnreadCount = await getUnreadNotifications(account) || 0
    eventEmitter.emit(EVENT_UPDATE_NOTIFICATIONS_COUNTER, account, currentUnreadCount);
  } catch (err) {
    log.error(`Failed to update unread notifications by account ${account}. Error:`, err.stack);
  }
}

export const getUnreadNotifications = async (account: string) => {
  const query = `
    SELECT unread_count FROM df.notifications_counter
    WHERE account = $1;
  `
  try {
    const res = await pool.query(query, [ account ])
    log.info(`Found ${res.rows[0].unread_count} unread notifications by account ${account}`)
    return res.rows[0].unread_count as number;
  } catch (err) {
    log.error(`Failed to calculate unread notifications by account ${account}. Error:`, err.stack);
    return 0
  }
}
