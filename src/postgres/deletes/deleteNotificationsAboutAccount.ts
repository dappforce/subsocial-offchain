import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

const query = `
  DELETE FROM df.notifications
  WHERE account = $1 AND (block_number, event_index) IN (
    SELECT block_number, event_index
    LEFT JOIN df.accountblock_number_followers
    ON df.activities.account = df.account_followers.following_account
    WHERE account = $2
  )
  RETURNING *`

export async function deleteNotificationsAboutAccount (userId: string, accountId: string) {
  const params = [ userId, accountId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutAccount)
  }
}