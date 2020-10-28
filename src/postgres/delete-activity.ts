import { pg } from '../connections/connect-postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsLog, deleteNotificationsLogError } from './postges-logger';

export const deleteNotificationsAboutComment = async (userId: string, commentId: PostId) => {
  const query = `
      DELETE FROM df.notifications
      WHERE account = $1
        AND activity_id IN
          (SELECT df.activities.id
          FROM df.activities
          LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_comment_id WHERE comment_id = $2)
      RETURNING *`
  const encodedCommentId = encodeStructId(commentId);
  const params = [ userId, encodedCommentId ];
  try {
    await pg.query(query, params)
    deleteNotificationsLog('comment')
  } catch (err) {
    deleteNotificationsLogError('comment', err.stack)
    throw err
  }
}

export const deleteNotificationsAboutAccount = async (userId: string, accountId: string) => {
  const query = `
      DELETE FROM df.notifications
      WHERE account = $1
        AND activity_id IN
          (SELECT df.activities.id FROM df.activities
          LEFT JOIN df.account_followers
          ON df.activities.account = df.account_followers.following_account
          WHERE account = $2)
      RETURNING *`
  const params = [ userId, accountId ];
  try {
    await pg.query(query, params)
    deleteNotificationsLog('account')
  } catch (err) {
    deleteNotificationsLogError('account', err.stack)
    throw err
  }
}

export const deleteNotificationsAboutPost = async (userId: string, postId: PostId) => {
  const query = `
      DELETE FROM df.notifications
      WHERE account = $1 AND activity_id IN
        (SELECT df.activities.id
        FROM df.activities
        LEFT JOIN df.post_followers ON df.activities.account = df.post_followers.following_post_id
        WHERE post_id = $2)
      RETURNING *`
  const encodedPostId = encodeStructId(postId);
  const params = [ userId, encodedPostId ];
  try {
    await pg.query(query, params)
    deleteNotificationsLog('post')
  } catch (err) {
    deleteNotificationsLogError('post', err.stack)
    throw err
  }
}

export const deleteNotificationsAboutSpace = async (userId: string, spaceId: SpaceId) => {
  const query = `
      DELETE FROM df.notifications
      WHERE account = $1
        AND activity_id IN
          (SELECT df.activities.id
          FROM df.activities
          LEFT JOIN df.space_followers ON df.activities.account = df.space_followers.following_space_id
          WHERE space_id = $2)
      RETURNING *`
  const encodedSpaceId = encodeStructId(spaceId);
  const params = [ userId, encodedSpaceId ];
  try {
    await pg.query(query, params)
    deleteNotificationsLog('space')
  } catch (err) {
    deleteNotificationsLogError('space', err.stack)
    throw err
  }
}
