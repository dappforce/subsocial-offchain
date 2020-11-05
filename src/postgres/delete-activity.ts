import { pg } from '../connections/postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { newPgError } from './utils';

export const deleteNotificationsAboutComment = async (userId: string, commentId: PostId) => {
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

  const encodedCommentId = encodeStructId(commentId);
  const params = [ userId, encodedCommentId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutComment)
  }
}

export const deleteNotificationsAboutAccount = async (userId: string, accountId: string) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1 AND (block_number, event_index) IN (
      SELECT block_number, event_index
      LEFT JOIN df.accountblock_number_followers
      ON df.activities.account = df.account_followers.following_account
      WHERE account = $2
    )
    RETURNING *`

  const params = [ userId, accountId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutAccount)
  }
}

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

export const deleteNotificationsAboutSpace = async (userId: string, spaceId: SpaceId) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1
      AND (block_number, event_index) IN (
        SELECT block_number, event_index
        FROM df.activities
        LEFT JOIN df.space_followers
        ON df.activities.space_id = df.space_followers.following_space_id
        WHERE space_id = $2
      )
    RETURNING *`

  const encodedSpaceId = encodeStructId(spaceId);
  const params = [ userId, encodedSpaceId ];
  
  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutSpace)
  }
}
