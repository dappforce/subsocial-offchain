import { runQuery, newPgError } from '../utils';
// import { log } from '../postges-logger';

const query = `
  UPDATE df.email_settings
  SET confirmation_code = :confirmationCode
  WHERE account = :account
  RETURNING *`

export async function setConfirmationCode(account: string, confirmationCode: string) {
  const params = { account, confirmationCode };
  try {
    const res = await runQuery(query, params)
    return res.rows[0]
  } catch (err) {
    throw newPgError(err, setConfirmationCode)
  }
};