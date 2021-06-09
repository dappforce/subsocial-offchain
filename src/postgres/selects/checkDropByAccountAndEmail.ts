import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
  SELECT DISTINCT account, original_email, formatted_email FROM df.token_drops
  WHERE formatted_email = :formatted_email
`

type Result = {
  account: string,
	original_email: string,
	formatted_email: string
}

export const checkDropByAccountAndEmail = async (formatted_email: string): Promise<Result> => {
	try {
		const data = await runQuery(query, { formatted_email })
		return data.rows[0] || {} as Result
	} catch (err) {
		log.error(`Failed to check drop by email(${formatted_email}):`, err.stack)
		throw err
	}
}
