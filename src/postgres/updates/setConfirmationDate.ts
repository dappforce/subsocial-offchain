import { runQuery, newPgError, isValidSignature, upsertNonce } from '../utils';
import { getConfirmationData } from '../selects/getConfirmationCode';
import { log } from '../postges-logger';
import { ConfirmEmail, SessionCall } from '../types/sessionKey';
import { updateNonce } from './updateNonce';
import { BaseConfirmData } from '../../express-api/faucet/types';
import dayjs from 'dayjs'
import { nonEmptyStr } from '@subsocial/utils';
import { OkOrError } from '../../express-api/utils';

const query = `
  UPDATE df.email_settings
  SET confirmed_on = :date
  WHERE account = :account
  RETURNING *`

export const setConfirmationDate = async ({ account, confirmationCode: confirmationCodeFromClient }: BaseConfirmData): Promise<OkOrError> => {
  const params = { account, date: dayjs() };
    try {
      const { confirmation_code, expires_on, confirmed_on } = await getConfirmationData(account)

      if (nonEmptyStr(confirmed_on)) return { ok: true }

      if (confirmation_code != confirmationCodeFromClient) {
        log.error('Confirmation code is wrong')
        return { ok: false, errors: { confirm: 'Confirmation code is wrong' } }
      }

      if (dayjs().diff(expires_on) > 0) {
        log.error('Outdate')
        return { ok: false, errors: { confirm: 'Confirmation code is outdate' } }
      }

      const res = await runQuery(query, params)
      if (!res.rows[0]) return { ok: false, errors: { confirm: 'This email is not found' } }

      return { ok: true }
    } catch (err) {
      throw newPgError(err, setConfirmationDateForSettings)
    }
}

export async function setConfirmationDateForSettings(sessionCall: SessionCall<ConfirmEmail>) {
  const { account, message } = sessionCall

  const { nonce, rootAddress } = await upsertNonce(account, message)

  if (parseInt(nonce.toString()) === message.nonce) {
    const isValid = isValidSignature(sessionCall)
    if (!isValid) {
      log.error("Signature is not valid: function setConfirmationCode")
      return false
    }
    log.debug(`Signature verified`)

    const confirmationCode = message.args.confirmationCode

    await setConfirmationDate({ account: rootAddress, confirmationCode })
    await updateNonce(account, message.nonce + 1)
  }

  return false
}
