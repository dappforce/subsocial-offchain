import { pool } from '../adaptors/connect-postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, CommentId, BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { updateUnreadNotifications } from './notifications';
import { fillNotificationsLog, fillNewsFeedLog, fillNewsFeedLogError, fillNotificationsLogError } from './postges-logger';

export const fillNewsFeedWithAccountFollowers = async (account: string, activityId: number) => {
  const query = `
      INSERT INTO df.news_feed (account, activity_id)
        (SELECT df.account_followers.follower_account, df.activities.id
        FROM df.activities
        LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
        WHERE df.account_followers.follower_account <> $1
          AND id = $2
          AND (df.account_followers.follower_account, df.activities.id)
          NOT IN (SELECT account, activity_id from df.news_feed))
      RETURNING *`
  const params = [ account, activityId ];
  try {
    await pool.query(query, params)
    fillNewsFeedLog('account')
  } catch (err) {
    fillNewsFeedLogError('account', err.stack);
  }
}

export const fillNotificationsWithAccountFollowers = async (account: string, activityId: number) => {
  const query = `
      INSERT INTO df.notifications (account, activity_id)
        (SELECT df.account_followers.follower_account, df.activities.id
        FROM df.activities
        LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
        WHERE df.account_followers.follower_account <> $1
          AND id = $2
          AND aggregated = true
          AND (df.account_followers.follower_account, df.activities.id)
          NOT IN (SELECT account, activity_id from df.notifications))
      RETURNING *`
  const params = [ account, activityId ];
  try {
    await pool.query(query, params)
    fillNotificationsLog('account')
    await updateUnreadNotifications(account)
  } catch (err) {
    fillNotificationsLogError('account', err.stack);
  }
}

export const fillNewsFeedWithBlogFollowers = async (blogId: BlogId, account: string, activityId: number) => {
  const query = `
      INSERT INTO df.news_feed(account, activity_id)
        (SELECT df.blog_followers.follower_account, df.activities.id
        FROM df.activities
        LEFT JOIN df.blog_followers ON df.activities.blog_id = df.blog_followers.following_blog_id
        WHERE blog_id = $1 AND df.blog_followers.follower_account <> $2
          AND id = $3
          AND aggregated = true
          AND (df.blog_followers.follower_account, df.activities.id)
          NOT IN (SELECT account,activity_id from df.news_feed))
      RETURNING *`;
  const hexBlogId = encodeStructId(blogId);
  const params = [ hexBlogId, account, activityId ];
  try {
    await pool.query(query, params)
    fillNewsFeedLog('blog')
    await updateUnreadNotifications(account)
  } catch (err) {
    fillNewsFeedLogError('blog', err.stack);
  }
}

export const fillNotificationsWithPostFollowers = async (postId: PostId, account: string, activityId: number) => {
  const query = `
      INSERT INTO df.notifications(account, activity_id)
        (SELECT df.post_followers.follower_account, df.activities.id
        FROM df.activities
        LEFT JOIN df.post_followers ON df.activities.post_id = df.post_followers.following_post_id
        WHERE post_id = $1 AND id = $3 AND aggregated = true AND parent_comment_id IS NULL
          AND df.post_followers.follower_account <> $2
          AND (df.post_followers.follower_account, df.activities.id)
          NOT IN (SELECT account,activity_id from df.notifications))
      RETURNING *`
  const hexPostId = encodeStructId(postId);
  const params = [ hexPostId, account, activityId ];
  try {
    await pool.query(query, params)
    fillNotificationsLog('post')
    await updateUnreadNotifications(account)
  } catch (err) {
    fillNotificationsLogError('post', err.stack);
  }
}

export const fillNotificationsWithCommentFollowers = async (commentId: CommentId, account: string, activityId: number) => {
  const query = `
      INSERT INTO df.notifications(account, activity_id)
        (SELECT df.comment_followers.follower_account, df.activities.id
        FROM df.activities
        LEFT JOIN df.comment_followers ON df.activities.comment_id = df.comment_followers.following_comment_id WHERE comment_id = $1 AND id = $3 AND aggregated = true
          AND df.comment_followers.follower_account <> $2
          AND (df.comment_followers.follower_account, df.activities.id)
          NOT IN (SELECT account,activity_id from df.notifications))
      RETURNING *`
  const hexCommentId = encodeStructId(commentId);
  const params = [ hexCommentId, account, activityId ];
  try {
    await pool.query(query, params)
    fillNotificationsLog('comment')
    await updateUnreadNotifications(account)
  } catch (err) {
    fillNotificationsLogError('comment', err.stack);
  }
}
