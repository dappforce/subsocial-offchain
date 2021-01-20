import { faucetAmount } from '../../env';
import { insertTokenDrop } from '../../postgres/inserts/insertTokenDrop';
import { getConfirmationData } from '../../postgres/selects/getConfirmationCode';
import { setConfirmationDate } from '../../postgres/updates/setConfirmationDate';
import { OkOrError } from '../utils';
import { checkWasTokenDrop } from './check';
import { faucetPublicKey, transferToken } from './transfer';
import { BaseConfirmData } from "./types";

export const tokenDrop = async (confirmData: BaseConfirmData): Promise<OkOrError> => {
  const { account } = confirmData

  try {
    const { email } = await getConfirmationData(account)
    const isConfirmed = await setConfirmationDate(confirmData)
    const { ok: noTokenDrop, errors } = await checkWasTokenDrop({ account, email })

    if (isConfirmed && noTokenDrop) {
      await insertTokenDrop({ faucet: faucetPublicKey, account, amount: faucetAmount, email, captcha_solved: true })
      await transferToken()
      return { ok: true }
    } else {
      throw errors
    }

  } catch (err) {
    return { ok: false, errors: err }
  }

}