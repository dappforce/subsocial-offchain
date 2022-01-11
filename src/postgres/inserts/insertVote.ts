const upsertVoteQuery = `
  INSERT INTO df.casted_votes(poll_id, account, vote, signature)
  VALUES(:pollId, :account, :vote, :signature)
  ON CONFLICT (poll_id, account) 
	DO UPDATE SET
		vote = :vote,
		signature = :signature;
`

import { OkOrError } from '../../express-api/utils'
import { UpsertVote } from '../../models'
import { newPgError, runQuery } from '../utils'

export async function upsertVote (params: UpsertVote): Promise<OkOrError> {
	try {
		await runQuery(upsertVoteQuery, params)
		return { ok: true }
	} catch (err) {
		throw newPgError(err, upsertVote)
	}
}