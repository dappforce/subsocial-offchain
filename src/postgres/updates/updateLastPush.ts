import { runQuery, newPgError } from '../utils';

const query = `
  UPDATE df.telegram_chats
  SET last_push_block_number = :blockNumber, last_push_event_index = :eventIndex
  WHERE account = :account AND chat_id = :chatId AND current_account = true
  RETURNING *`

export async function updateLastPush(account: string, chatId: number, blockNumber: string, eventIndex: number) {
    const params = { blockNumber, eventIndex, account, chatId};
    try {
      const res = await runQuery(query, params)
      return res.rows[0]
    } catch (err) {
      throw newPgError(err, updateLastPush)
    }
  };