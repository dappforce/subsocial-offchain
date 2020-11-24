// import { fillAccountFollowerQuery } from './fillTableQueries';
import { newPgError, runQuery } from '../utils';
// import { pg } from '../../connections/postgres';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { sql } from '@pgtyped/query';
import { IQueryParams, IQueryQuery } from '../types/fillNotificationsWithAccountFollowers.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.notifications (account, block_number, event_index)
  (SELECT df.account_followers.follower_account, df.activities.block_number, df.activities.event_index
  FROM df.activities
  LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
  WHERE df.account_followers.follower_account <> $account
    AND block_number = $blockNumber
    AND event_index = $eventIndex
    AND (df.account_followers.follower_account, df.activities.block_number, df.activities.event_index)
    NOT IN (SELECT account, block_number, event_index from df.notifications))
  RETURNING *`

export async function fillNotificationsWithAccountFollowers({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  // const query = fillAccountFollowerQuery("notifications")
  const params: IQueryParams = { account, blockNumber, eventIndex };

  try {
    await runQuery(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNotificationsWithAccountFollowers)
  }
}