import { pool } from '../adaptors/connect-postgre';
import { encodeStructId } from '../substrate/utils';
import * as events from 'events'
import { PostId, CommentId, BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsLog, deleteNotificationslogError } from './postges-logger';
export const eventEmitter = new events.EventEmitter();
export const EVENT_UPDATE_NOTIFICATIONS_COUNTER = 'eventUpdateNotificationsCounter'

export const deleteNotificationsAboutComment = async (userId: string, commentId: CommentId) => {
  const query = `
      DELETE FROM df.notifications
      WHERE account = $1
        AND activity_id IN
          (SELECT df.activities.id
          FROM df.activities
          LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_comment_id WHERE comment_id = $2)
      RETURNING *`
  const hexCommentId = encodeStructId(commentId);
  const params = [ userId, hexCommentId ];
  try {
    await pool.query(query, params)
    deleteNotificationsLog('comment')
  } catch (err) {
    deleteNotificationslogError('comment', err.stack)
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
    await pool.query(query, params)
    deleteNotificationsLog('account')
  } catch (err) {
    deleteNotificationslogError('account', err.stack)
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
  const hexPostId = encodeStructId(postId);
  const params = [ userId, hexPostId ];
  try {
    await pool.query(query, params)
    deleteNotificationsLog('post')
  } catch (err) {
    deleteNotificationslogError('post', err.stack)
  }
}

export const deleteNotificationsAboutBlog = async (userId: string, blogId: BlogId) => {
  const query = `
      DELETE FROM df.notifications
      WHERE account = $1
        AND activity_id IN
          (SELECT df.activities.id
          FROM df.activities
          LEFT JOIN df.blog_followers ON df.activities.account = df.blog_followers.following_blog_id
          WHERE blog_id = $2)
      RETURNING *`
  const hexBlogId = encodeStructId(blogId);
  const params = [ userId, hexBlogId ];
  try {
    await pool.query(query, params)
    deleteNotificationsLog('blog')
  } catch (err) {
    deleteNotificationslogError('blog', err.stack)
  }
}
