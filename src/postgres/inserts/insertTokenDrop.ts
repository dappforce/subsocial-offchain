import { TokenDropsColumns } from '../../express-api/faucet/types'
import { newPgError, runQuery } from '../utils'

const query = `
  INSERT INTO df.token_drops (faucet, account, amount, captcha_solved, email, telegram_id, discord_id)
  VALUES(:faucet, :account, :amount, :captcha_solved, :email, :telegram_id, :discord_id)
`

export async function insertTokenDrop (params: TokenDropsColumns) {
	try {
		await runQuery(query, params)
	} catch (err) {
		throw newPgError(err, insertTokenDrop)
	}
}