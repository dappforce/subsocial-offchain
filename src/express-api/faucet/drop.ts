import { GenericAccountId } from '@polkadot/types/generic';
import { registry } from '@subsocial/types/substrate/registry';
import { faucetAmount } from '../../env';
import { insertTokenDrop } from '../../postgres/inserts/insertTokenDrop';
import { getConfirmationData } from '../../postgres/selects/getConfirmationCode';
import { setConfirmationDate } from '../../postgres/updates/setConfirmationDate';
import { OkOrError } from '../utils';
import { checkWasTokenDrop } from './check';
import { getFaucetPublicKey, transferToken } from './transfer';
import { BaseConfirmData, FaucetFormData } from "./types";

export const tokenDrop = async ({ account, email }: Omit<FaucetFormData, 'token'>): Promise<OkOrError> => {
  const { ok: noTokenDrop, errors } = await checkWasTokenDrop({ account, email })

  if (!noTokenDrop) return { ok: false, errors }

  await transferToken(account,
    (block_number, event_index) => insertTokenDrop({
      block_number,
      event_index,
      faucet: getFaucetPublicKey(),
      account,
      amount: faucetAmount,
      email,
      captcha_solved: true
    }))

  return { ok: true }
}

export const confirmAndTokenDrop = async ({ account: clientSideAccount, confirmationCode }: BaseConfirmData): Promise<OkOrError> => {
  const account = new GenericAccountId(registry, clientSideAccount).toString()
  try {
    const { email } = await getConfirmationData(account)
    const { ok, errors } = await setConfirmationDate({ account, confirmationCode })

    if (ok) {
     return tokenDrop({ account, email })
    } else {
      throw errors
    }

  } catch (err) {
    return { ok: false, errors: err?.stack || err }
  }

}