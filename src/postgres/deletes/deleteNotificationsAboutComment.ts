import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryParams, IQueryQuery } from '../types/deleteNotificationsAboutComment.queries';

const query = sql<IQueryQuery>`
  DELETE FROM df.notifications
  WHERE account = $account AND (block_number, event_index) IN (
    SELECT block_number, event_index
    FROM df.activities
    LEFT JOIN df.comment_followers
      ON df.activities.account = df.comment_followers.follower_account
    WHERE comment_id = $commentId
  )
  RETURNING *`

export async function deleteNotificationsAboutComment (userId: string, commentId: string) {
  const encodedCommentId = encodeStructId(commentId);
  const params: IQueryParams = { account: userId, commentId: encodedCommentId };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutComment)
  }
}