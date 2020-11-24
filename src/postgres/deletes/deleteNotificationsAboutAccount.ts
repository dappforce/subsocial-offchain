import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/deleteNotificationsAboutAccount.queries';

const query = sql<IQueryQuery>`
  DELETE FROM df.notifications
  WHERE account = $account AND (block_number, event_index) IN (
    SELECT block_number, event_index
    FROM df.activities
    LEFT JOIN df.account_followers
      ON df.activities.account = df.account_followers.following_account
    WHERE account = $activitiesAccount
  )
  RETURNING *`

export async function deleteNotificationsAboutAccount (userId: string, accountId: string) {
  const params: IQueryParams = { account: userId, activitiesAccount: accountId };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutAccount)
  }
}