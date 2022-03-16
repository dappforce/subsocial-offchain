const upsertVoteQuery = `
  INSERT INTO df.casted_votes(poll_id, account, vote, signature, amount)
  VALUES(:pollId, :account, :vote, :signature, :amount)
  ON CONFLICT (poll_id, account) 
	DO UPDATE SET
		vote = :vote,
		signature = :signature;
`

import { isAccountFromSnapshot } from '../../express-api/handlers/tokensaleHandlers/utils'
import { OkOrError } from '../../express-api/utils'
import { UpsertVote } from '../../models'
// import { encodeStructId } from '../../substrate/utils'
import { newPgError, runQuery } from '../utils'

export async function upsertVote (signedMessage: UpsertVote): Promise<OkOrError> {
	try {
		const { message: { vote, pollId }, signature, account } = signedMessage

		if (!isAccountFromSnapshot(signedMessage.account)) throw new Error('Account was not found in the snapshot')

		// const { account } = snapshotData

		// const amount = encodeStructId(snapshotData.amount)
		const amount = 0
		// TODO: make snapshot w/ amount { account: amount }
		await runQuery(upsertVoteQuery, { account, vote, pollId, amount, signature })
		return { ok: true }
	} catch (err) {
		throw newPgError(err, upsertVote)
	}
}