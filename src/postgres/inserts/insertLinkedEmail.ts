const upsertLinkedEmailQuery = `
  INSERT INTO df.linked_emails(account, email, signature)
  VALUES(:account, :email, :signature)
  ON CONFLICT (account) 
	DO UPDATE SET
    email = :email,
		signature = :signature;
`

import { isAccountFromSnapshot } from '../../express-api/handlers/tokensaleHandlers/utils'
import { OkOrError } from '../../express-api/utils'
import { UpsertLinkedEmail } from '../../models/linked-emails'
import { newPgError, runQuery } from '../utils'

enum Errors {
  AccountIsNotEligible = 'AccountIsNotEligible'
}

export async function upsertLinkedEmail(signMessage: UpsertLinkedEmail): Promise<OkOrError> {
  try {
    const {
      message: { email },
      signature,
      account
    } = signMessage

    const isEligible = isAccountFromSnapshot(account)

    if (!isEligible)
      return {
        ok: false,
        errors: {
          account: Errors.AccountIsNotEligible
        }
      }

    await runQuery(upsertLinkedEmailQuery, { account, email, signature })
    return { ok: true }
  } catch (err) {
    throw newPgError(err, upsertLinkedEmail)
  }
}
