import { PostId } from '@subsocial/types/substrate/interfaces';
import { encodeStructId } from '../../substrate/utils';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

const query = `
  DELETE FROM df.notifications
  WHERE account = $1 AND (block_number, event_index) IN (
    SELECT block_number, event_index
    FROM df.activities
    LEFT JOIN df.account_followers
    ON df.activities.account = df.account_followers.following_comment_id
    WHERE comment_id = $2
  )
  RETURNING *`

export async function deleteNotificationsAboutComment (userId: string, commentId: PostId) {
  const encodedCommentId = encodeStructId(commentId);
  const params = [ userId, encodedCommentId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutComment)
  }
}