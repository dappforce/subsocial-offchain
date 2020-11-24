import { ActivitiesParamsWithAccount } from '../queries/types';
// import { fillTableWith } from './fillTableQueries';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
// import { pg } from '../../connections/postgres';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/fillNotificationsWithCommentFollowers.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.notifications (account, block_number, event_index)
  (SELECT df.comment_followers.follower_account, df.activities.block_number, df.activities.event_index
  FROM df.activities
  LEFT JOIN df.comment_followers ON df.activities.comment_id = df.comment_followers.following_comment_id
  WHERE comment_id = $commentId
    AND df.comment_followers.follower_account <> $account
    AND block_number = $blockNumber
    AND event_index = $eventIndex
    AND aggregated = true
    AND (df.comment_followers.follower_account, df.activities.block_number, df.activities.event_index)
      NOT IN (SELECT account, block_number, event_index from df.notifications))
  RETURNING *;`

export async function fillNotificationsWithCommentFollowers(commentId: string, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  // const query = fillTableWith("notifications", "comment")
  const encodedCommentId = encodeStructId(commentId);
  const params: IQueryParams = { commentId: encodedCommentId, account, blockNumber, eventIndex };

  try {
    await runQuery(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNotificationsWithCommentFollowers)
  }
}