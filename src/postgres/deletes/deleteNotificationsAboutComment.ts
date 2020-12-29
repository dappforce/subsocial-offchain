import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { IQueryParams } from '../types/deleteNotificationsAboutComment.queries';

const query = `
  DELETE FROM df.notifications
  WHERE account = :account AND (block_number, event_index) IN (
    SELECT block_number, event_index
    FROM df.activities
    LEFT JOIN df.comment_followers
      ON df.activities.account = df.comment_followers.follower_account
    WHERE comment_id = :commentId
  )
  RETURNING *`

export async function deleteNotificationsAboutComment (userId: string, commentId: string) {
  const encodedCommentId = encodeStructId(commentId);
  const params = { account: userId, commentId: encodedCommentId };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutComment)
  }
}