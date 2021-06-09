import { runQuery, newPgError } from '../utils';
import { formatEmail } from '@subsocial/utils/email';

const query = `
  UPDATE df.email_settings
  SET confirmed_on = NULL
  WHERE account = :account AND formatted_email != :formattedEmail
  RETURNING *`

export async function clearConfirmationDate(account: string, email: string) {
  const formattedEmail = formatEmail(email)
  try {
    const params = { account, formattedEmail };
    const res = await runQuery(query, params)
    if (!res?.rows[0])
      return false
    return true
  } catch (err) {
    throw newPgError(err, clearConfirmationDate)
  }
}