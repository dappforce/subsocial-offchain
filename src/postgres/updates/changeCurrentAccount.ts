import { runQuery, newPgError } from '../utils';

const updateCurrentQuery = `
  UPDATE df.telegram_chats
  SET current_account = false
  WHERE NOT (account = :account) AND chat_id = :chatId
  RETURNING *`

export async function changeCurrentAccount(account: string, chatId: number) {
    const params = { account, chatId };
    try {
      const res = await runQuery(updateCurrentQuery, params)
      return res.rows[0]
    } catch (err) {
      throw newPgError(err, changeCurrentAccount)
    }
  };