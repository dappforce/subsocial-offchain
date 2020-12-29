import { runQuery, newPgError } from '../utils';

const getQuery = `
  SELECT account FROM df.telegram_chats
  WHERE chat_id = :chatId AND current_account = true`

export async function getAccountByChatId(chatId: number) {
    const params = { chatId: Number(chatId) };

    try {
      const res = await runQuery(getQuery, params)
      return res.rows[0]?.account
    } catch (err) {
      throw newPgError(err, getAccountByChatId)
    }
  };