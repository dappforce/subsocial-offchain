import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
  SELECT account, original_email, formatted_email FROM df.token_drops
  WHERE account = :account
    OR formatted_email = :formatted_email
`

type Result = {
  account: string,
	original_email: string,
	formatted_email: string
}

export const checkDropByAccountAndEmail = async (account: string, formatted_email: string): Promise<Result> => {
	try {
		const data = await runQuery(query, { account, formatted_email })
		return data.rows[0] || {} as Result
	} catch (err) {
		log.error(`Failed to check drop by account(${account}) and email(${formatted_email}):`, err.stack)
		throw err
	}
}
