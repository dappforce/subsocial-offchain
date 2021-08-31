import { informClientAboutUnreadNotifications } from '../../express-api/events';
import { log } from '../postges-logger';
import { runQuery, isValidSignature, upsertNonce } from '../utils';
import { SessionCall, ReadAllMessage } from '../types/sessionKey';
import { updateNonce } from './updateNonce';

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

  const { nonce, rootAddress } = await upsertNonce(account, message)

  if (parseInt(nonce.toString()) === message.nonce) {
    const isValid = isValidSignature({ account, signature, message } as SessionCall<ReadAllMessage>)
    if (!isValid) {
      log.error("Signature is not valid: function markAllNotifsAsRead ")
      return
    }

    log.debug(`Signature verified`)
    try {
      const data = await runQuery(query, { account: rootAddress })
      informClientAboutUnreadNotifications(rootAddress, 0)
      log.debug(`Marked all notifications as read by account: ${rootAddress}`)

      await updateNonce(account, message.nonce + 1)

      return data.rowCount
    } catch (err) {
      log.error(`Failed to mark all notifications as read by account: ${rootAddress}`, err.stack)
      throw err
    }
  }
}