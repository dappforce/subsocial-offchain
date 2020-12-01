import { informClientAboutUnreadNotifications } from '../../express-api/events';
import { log } from '../postges-logger';
import { runQuery, isValidSignature } from '../utils';
import { SessionCall, ReadAllMessage } from '../types/sessionKey';
import { isOwner } from '../selects/getSessionKey';

const query = `
  WITH last_activity AS (
    SELECT block_number, event_index
    FROM df.notifications
    WHERE account = :account
    ORDER BY
      block_number DESC,
      event_index DESC
    LIMIT 1
  )

  UPDATE df.notifications_counter
  SET
    unread_count = 0,
    last_read_block_number = (select block_number from last_activity),
    last_read_event_index = (select event_index from last_activity)
  WHERE account = :account`

export async function markAllNotifsAsRead(sessionCall: SessionCall<ReadAllMessage>) {
  const { account, signature, message } = sessionCall

  if(isOwner(account, message.args.sessionKey)) {
    const isValid = isValidSignature({account: message.args.sessionKey, signature, message } as SessionCall<ReadAllMessage>)
    if (!isValid) {
      log.error("Signature is not valid: function markAllNotifsAsRead ")
      return
    }
    log.info(`Message confirmed successfully`)

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
  log.error(`The session key does not belong to the account ${account}`)
}

