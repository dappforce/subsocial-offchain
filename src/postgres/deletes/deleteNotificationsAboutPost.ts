import { newPgError, runQuery } from '../utils';
import { encodeStructId } from '../../substrate/utils';
import { IQueryParams } from '../types/deleteNotificationsAboutPost.queries';

const query = `
  DELETE FROM df.notifications
  WHERE account = :account AND (block_number, event_index) IN (
    SELECT block_number, event_index
    FROM df.activities
    LEFT JOIN df.post_followers
      ON df.activities.post_id = df.post_followers.following_post_id
    WHERE post_id = :postId
  )
  RETURNING *`

export async function deleteNotificationsAboutPost (userId: string, postId: string) {
  const encodedPostId = encodeStructId(postId);
  const params = { account: userId, postId: encodedPostId };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutPost)
  }
}