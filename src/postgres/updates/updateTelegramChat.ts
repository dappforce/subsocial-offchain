import { runQuery, newPgError } from '../utils';

const updateQuery = `
  UPDATE df.telegram_chats
  SET push_notifs = :pushNotifs, push_feeds = :pushFeeds
  WHERE account = :account AND chat_id = :chatId AND current_account = true
  RETURNING *`

export async function updateTelegramChat(account: string, chatId: number, pushNotifs: boolean, pushFeeds: boolean) {
    const params = { account, chatId, pushNotifs, pushFeeds };
    try {
      const res = await runQuery(updateQuery, params)
      return res.rows[0]
    } catch (err) {
      throw newPgError(err, updateTelegramChat)
    }
  };