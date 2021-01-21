import { GenericAccountId } from '@polkadot/types/generic';
import { registry } from '@subsocial/types/substrate/registry';
import { faucetAmount } from '../../env';
import { insertTokenDrop } from '../../postgres/inserts/insertTokenDrop';
import { getConfirmationData } from '../../postgres/selects/getConfirmationCode';
import { setConfirmationDate } from '../../postgres/updates/setConfirmationDate';
import { OkOrError } from '../utils';
import { checkWasTokenDrop } from './check';
import { getFaucetPublicKey, transferToken } from './transfer';
import { BaseConfirmData } from "./types";

export const tokenDrop = async ({ account: clientSideAccount, confirmationCode }: BaseConfirmData): Promise<OkOrError<number>> => {
  const account = new GenericAccountId(registry, clientSideAccount).toString()
  try {
    const { email } = await getConfirmationData(account)
    const isConfirmed = await setConfirmationDate({ account, confirmationCode })
    const { ok: noTokenDrop, errors } = await checkWasTokenDrop({ account, email })

    console.log(isConfirmed, noTokenDrop)
    if (/* isConfirmed && */noTokenDrop) {
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

      return { ok: true, data: faucetAmount }
    } else {
      throw errors
    }

  } catch (err) {
    return { ok: false, errors: err?.stack || err }
  }

}