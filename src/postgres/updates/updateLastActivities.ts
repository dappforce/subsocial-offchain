import { runQuery, newPgError } from '../utils';

const query = `
  UPDATE df.email_settings
  SET last_block_number = :blockNumber, last_event_index = :eventIndex
  WHERE account = :account AND confirmed_on IS NOT NULL
  RETURNING *`

export async function updateLastPush(account: string, blockNumber: string, eventIndex: number) {
    const params = { blockNumber, eventIndex, account};
    try {
      const res = await runQuery(query, params)
      return res.rows[0]
    } catch (err) {
      throw newPgError(err, updateLastPush)
    }
  };