import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
  SELECT confirmation_code, expires_on, confirmed_on, original_email FROM df.email_settings
  WHERE account = :account`

export const getConfirmationData = async (account: string) => {
	try {
		const data = await runQuery(query, { account })
		return data.rows[0] || {}
	} catch (err) {
		log.error(`Failed to get confirmation data by account: ${account}`, err.stack)
		throw err
	}
}