import { newPgError, runQuery } from '../utils';
import { IQueryParams } from '../types/deleteNotificationsAboutAccount.queries';

const query = `
  DELETE FROM df.notifications
  WHERE account = :account AND (block_number, event_index) IN (
    SELECT block_number, event_index
    FROM df.activities
    LEFT JOIN df.account_followers
      ON df.activities.account = df.account_followers.following_account
    WHERE account = :activitiesAccount
  )
  RETURNING *`

export async function deleteNotificationsAboutAccount (userId: string, accountId: string) {
  const params = { account: userId, activitiesAccount: accountId };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutAccount)
  }
}