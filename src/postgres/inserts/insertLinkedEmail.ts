const upsertLinkedEmailQuery = `
  INSERT INTO df.linked_emails(account, email,signature)
  VALUES(:account, :email, :signature)
  ON CONFLICT (account) 
	DO UPDATE SET
    email = :email,
		signature = :signature;
`

import { accountFromSnapshot } from '../../express-api/handlers/crowdloanHandlers/utils'
import { OkOrError } from '../../express-api/utils'
import { UpsertLinkedEmail } from '../../models/linked-emails'
import { newPgError, runQuery } from '../utils'

export async function upsertLinkedEmail (signMessage: UpsertLinkedEmail): Promise<OkOrError> {
	try {
		const { message: { email }, signature } = signMessage

		const snapshotData = accountFromSnapshot(signMessage.account)

		if (!snapshotData) throw new Error('The account dont exist in snapshot')

		const { account } = snapshotData

		await runQuery(upsertLinkedEmailQuery, { account, email, signature })
		return { ok: true }
	} catch (err) {
		throw newPgError(err, upsertLinkedEmail)
	}
}