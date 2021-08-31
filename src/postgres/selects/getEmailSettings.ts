import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
  SELECT * FROM df.email_settings
  WHERE account = :account`

export const getEmailSettingsByAccount = async (account: string) => {
	try {
		const data = await runQuery(query, { account })
		return data.rows[0]
	} catch (err) {
		log.error(`Failed to get email settings by account: ${account}`, err.stack)
		throw err
	}
}