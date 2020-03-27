import { pool } from '../adaptors/connect-postgre';
import * as events from 'events'
export const eventEmitter = new events.EventEmitter();
export const EVENT_UPDATE_NOTIFICATIONS_COUNTER = 'eventUpdateNotificationsCounter'

type AggCountProps = {
  eventName: string,
  account: string,
  post_id: string
}

export const insertNotificationForOwner = async (id: number, account: string) => {
  const query = `
      INSERT INTO df.notifications
        VALUES($1, $2) 
      RETURNING *`;
  const params = [ account, id ];
  try {
    const res = await pool.query(query, params)
    console.log(res.rows[0])
    await updateUnreadNotifications(account)
  } catch (err) {
    console.log(err.stack)
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
    console.log(res.rows[0].count)
    return res.rows[0].count as number;
  } catch (err) {
    console.log(err.stack)
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
    console.log('Done in updateUnreadNotifications:', res.rows)
    const currentUnreadCount = await getUnreadNotifications(account) || 0
    eventEmitter.emit(EVENT_UPDATE_NOTIFICATIONS_COUNTER, account, currentUnreadCount);
  } catch (err) {
    console.log('Error in updateUnreadNotifications:', err.stack);
  }
}

export const getUnreadNotifications = async (account: string) => {
  const query = `
    SELECT unread_count FROM df.notifications_counter
    WHERE account = $1;
  `
  try {
    const res = await pool.query(query, [ account ])
    console.log(res.rows[0].unread_count)
    return res.rows[0].unread_count as number;
  } catch (err) {
    console.log(err.stack);
    return 0
  }
}
