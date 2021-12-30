const upsertVoteQuery = `
  INSERT INTO df.casted_votes (poll_id, account, vote, signature)
  VALUES(:pollId, :account, :vote, :periodicity, :signature)
  ON CONFLICT (account) DO UPDATE
	SET vote = :vote,
	signature = :signature
`

import { UpsertVote } from '../../models'
import { newPgError, runQuery } from '../utils'

export async function upsertVote (params: UpsertVote) {
	try {
		await runQuery(upsertVoteQuery, params)
	} catch (err) {
		throw newPgError(err, upsertVote)
	}
}