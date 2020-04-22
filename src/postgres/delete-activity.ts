import { pg } from '../connections/connect-postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, CommentId, BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsLog, deleteNotificationsLogError } from './postges-logger';

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
    await pg.query(query, params)
    deleteNotificationsLog('comment')
  } catch (err) {
    deleteNotificationsLogError('comment', err.stack)
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
    await pg.query(query, params)
    deleteNotificationsLog('post')
  } catch (err) {
    deleteNotificationsLogError('post', err.stack)
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
    await pg.query(query, params)
    deleteNotificationsLog('blog')
  } catch (err) {
    deleteNotificationsLogError('blog', err.stack)
  }
}
