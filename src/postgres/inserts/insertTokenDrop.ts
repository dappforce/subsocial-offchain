import { TokenDropsColumns } from '../../express-api/faucet/types'
import { newPgError, runQuery } from '../utils'

const query = `
  INSERT INTO df.token_drops (block_number, event_index, faucet, account, amount, captcha_solved, email, telegram_id, discord_id)
  VALUES(:block_number, :event_index, :faucet, :account, :amount, :captcha_solved, :email, :telegram_id, :discord_id)
`

export async function insertTokenDrop (params: TokenDropsColumns) {
	try {
		await runQuery(query, { ...params, telegram_id: null, discord_id: null })
	} catch (err) {
		throw newPgError(err, insertTokenDrop)
	}
}