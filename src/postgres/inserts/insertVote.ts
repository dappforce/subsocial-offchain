const upsertVoteQuery = `
  INSERT INTO df.casted_votes(poll_id, account, vote, signature, amount)
  VALUES(:pollId, :account, :vote, :signature, :amount)
  ON CONFLICT (poll_id, account) 
	DO UPDATE SET
		vote = :vote,
		signature = :signature;
`

import { accountFromSnapshot } from '../../express-api/handlers/votesHandlers/utils'
import { OkOrError } from '../../express-api/utils'
import { UpsertVote } from '../../models'
import { encodeStructId } from '../../substrate/utils'
import { newPgError, runQuery } from '../utils'

export async function upsertVote (signMessage: UpsertVote): Promise<OkOrError> {
	try {
		const { message: { vote, pollId }, signature } = signMessage

		const snapshotData = accountFromSnapshot(signMessage.account)

		if (!snapshotData) throw new Error('The account dont exist in snapshot')

		const { account } = snapshotData

		const amount = encodeStructId(snapshotData.amount)

		await runQuery(upsertVoteQuery, { account, vote, pollId, amount, signature })
		return { ok: true }
	} catch (err) {
		throw newPgError(err, upsertVote)
	}
}