import { runQuery, newPgError } from '../utils';

const getChatQuery = `
  SELECT chat_id FROM df.telegram_chats
  WHERE account = :account AND current_account = true`

export async function getChatIdByAccount(account: string) {
    const params = { account };

    try {
      const res = await runQuery(getChatQuery, params)
      return res.rows[0]?.chat_id
    } catch (err) {
      throw newPgError(err, getChatIdByAccount)
    }
  };