import { runQuery, newPgError } from '../utils';
import { getConfirmationCode } from '../selects/getConfirmationCode';
import { log } from '../postges-logger';

const query = `
  UPDATE df.email_settings
  SET confirmed_on = :date
  WHERE account = :account
  RETURNING *`

export async function setConfirmationDate(account: string, confirmationCode: string) {
  const params = { account, date: new Date() };
  try {
    const confirmCodeFromDb = await getConfirmationCode(account)
    if (confirmCodeFromDb != confirmationCode) {
      log.error("Confirmation code is wrong")
    }
    const res = await runQuery(query, params)
    return res.rows[0]
  } catch (err) {
    throw newPgError(err, setConfirmationDate)
  }
};