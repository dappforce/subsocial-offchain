import { runQuery, newPgError } from '../utils';

const getTChatQuery = `
  SELECT * FROM df.telegram_chats
  WHERE account = :account AND chat_id = :chatId AND current_account = true`

export async function getTelegramChat(account: string, chatId: number) {
    const params = { account, chatId };
    try {
      const res = await runQuery(getTChatQuery, params)
      return res.rows[0]
    } catch (err) {
      throw newPgError(err, getTelegramChat)
    }
  };