import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
  SELECT confirmation_code FROM df.email_settings
  WHERE account = :account`

export const getConfirmationCode = async (account: string) => {
	try {
		const data = await runQuery(query, { account })
		return data.rows[0]?.confirmation_code
	} catch (err) {
		log.error(`Failed to get email settings by account: ${account}`, err.stack)
		throw err
	}
}