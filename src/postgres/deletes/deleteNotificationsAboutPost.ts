import { newPgError } from '../utils';
import { encodeStructId } from '../../substrate/utils';
import { pg } from '../../connections/postgres';
import { PostId } from '@subsocial/types/substrate/interfaces';

export const deleteNotificationsAboutPost = async (userId: string, postId: PostId) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1 AND (block_number, event_index) IN (
      SELECT block_number, event_index
      FROM df.activities
      LEFT JOIN df.post_followers
      ON df.activities.post_id = df.post_followers.following_post_id
      WHERE post_id = $2
    )
    RETURNING *`

  const encodedPostId = encodeStructId(postId);
  const params = [ userId, encodedPostId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutPost)
  }
}