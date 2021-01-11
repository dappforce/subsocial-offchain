import { runQuery } from '../utils';
import { log } from '../postges-logger';

const query = `
	SELECT * FROM df.email_settings
	WHERE confirmed_on is NOT NULL
		AND recurrence = :recurrence`

export const getAllEmailSettings = async (recurrence: string) => {
	try {
		const data = await runQuery(query, { recurrence })
		return data.rows
	} catch (err) {
		log.error(`Failed to get all email settings`, err.stack)
		throw err
	}
}