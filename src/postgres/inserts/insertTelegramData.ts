import { newPgError, runQuery } from '../utils';

const query = `
  INSERT INTO df.telegram_chats
    VALUES(:account, :chatId)
  ON CONFLICT (chat_id, account) DO UPDATE SET current_account = true
  RETURNING *`

export async function setTelegramData(account: string, chatId: number) {
  const params = { account, chatId: Number(chatId) };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, setTelegramData)
  }
};


