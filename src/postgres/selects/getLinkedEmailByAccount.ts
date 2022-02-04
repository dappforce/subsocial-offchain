import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
  SELECT DISTINCT account, email FROM df.linked_emails
  WHERE account = :account
`

type Result = {
  account: string,
  email: string
}

type Params = {
	account: string,
}

export const getLinkedEmailByAccount = async (params: Params): Promise<Result> => {
	try {
		const data = await runQuery(query, params)
		return data.rows[0]
	} catch (err) {
		log.error(`Failed to select linked email by account (${params.account}):`, err.stack)
		throw err
	}
}
