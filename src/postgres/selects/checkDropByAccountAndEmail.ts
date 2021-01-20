import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
  SELECT account, email FROM df.token_drops
  WHERE account = :account
    OR email = :email
`

type Result = {
  account: string,
  email: string
}

export const checkDropByAccountAndEmail = async (account: string, email: string) => {
	try {
		const data = await runQuery(query, { account, email })
		return data.rows[0] || {} as Result
	} catch (err) {
		log.error(`Failed to check drop by account(${account}) and email(${email}):`, err.stack)
		throw err
	}
}
