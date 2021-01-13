import { log } from '../postges-logger';
import { runQuery } from '../utils';
import * as BN from 'bn.js';
import { Activity } from '@subsocial/types';
import { ActivityTable } from '../queries/feed-and-notifs';

const createQuery = (type: string) => `
SELECT DISTINCT *
FROM df.activities
WHERE aggregated = true AND (block_number, event_index) IN (
	SELECT block_number, event_index
	FROM df.${type}
	WHERE account = :account AND block_number > (
		SELECT last_block_number
		FROM df.email_settings
		WHERE account = :account
	)
	ORDER BY block_number, event_index ASC
)`

export async function getActivitiesForEmailSender(account: string, blockNumber: BN, event_index: number, type: ActivityTable) {
	const params = { account, blockNumber: blockNumber.toNumber(), event_index };
	const query = createQuery(type)

	try {
		const res = await runQuery(query, params)
		return res.rows as Activity[];
	} catch (err) {
		log.error('Failed to select activities by blockNumber:', err.stack)
		throw err
	}
}