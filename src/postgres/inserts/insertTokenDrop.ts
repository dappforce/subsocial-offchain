import { formattingEmail } from '../../express-api/email/formatting-email'
import { TokenDropsColumns } from '../../express-api/faucet/types'
import { newPgError, runQuery } from '../utils'

const query = `
  INSERT INTO df.token_drops (block_number, event_index, faucet, account, amount, captcha_solved, original_email, formatted_email, telegram_id, discord_id)
  VALUES(:block_number, :event_index, :faucet, :account, :amount, :captcha_solved, :original_email, :formatted_email, :telegram_id, :discord_id)
`

export async function insertTokenDrop ({ email: original_email, ...params}: TokenDropsColumns) {
	try {
		const formatted_email = formattingEmail(original_email)
		await runQuery(query, { ...params, original_email, formatted_email, telegram_id: null, discord_id: null })
	} catch (err) {
		throw newPgError(err, insertTokenDrop)
	}
}