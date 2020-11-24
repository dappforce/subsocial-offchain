import { ActivitiesParamsWithAccount } from '../queries/types';
// import { fillTableWith } from './fillTableQueries';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
// import { pg } from '../../connections/postgres';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/fillNotificationsWithPostFollowers.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.notifications (account, block_number, event_index)
  (SELECT df.post_followers.follower_account, df.activities.block_number, df.activities.event_index
  FROM df.activities
  LEFT JOIN df.post_followers ON df.activities.post_id = df.post_followers.following_post_id
  WHERE post_id = $postId
    AND df.post_followers.follower_account <> $account
    AND block_number = $blockNumber
    AND event_index = $eventIndex
    AND aggregated = true
    AND parent_comment_id IS NULL
    AND (df.post_followers.follower_account, df.activities.block_number, df.activities.event_index)
      NOT IN (SELECT account, block_number, event_index from df.notifications))
  RETURNING *;`

export async function fillNotificationsWithPostFollowers(postId: string, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  // const query = fillTableWith("notifications", "post")
  const encodedPostId = encodeStructId(postId);
  const params: IQueryParams = { postId: encodedPostId, account, blockNumber, eventIndex };

  try {
    await runQuery(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNotificationsWithPostFollowers)
  }
}