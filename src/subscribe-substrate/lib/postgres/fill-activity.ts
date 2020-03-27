import { pool } from '../../../adaptors/connectPostgre';
import { encodeStructId } from '../utils';
import * as events from 'events'
import { PostId, CommentId, BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { updateUnreadNotifications } from './notifications';
export const eventEmitter = new events.EventEmitter();
export const EVENT_UPDATE_NOTIFICATIONS_COUNTER = 'eventUpdateNotificationsCounter'

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
    const res = await pool.query(query, params)
    console.log(res.rows)
  } catch (err) {
    console.log(err.stack);
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
    const res = await pool.query(query, params)
    console.log(res.rows)
    await updateUnreadNotifications(account)
  } catch (err) {
    console.log(err.stack);
  }
}

export const fillActivityStreamWithBlogFollowers = async (blogId: BlogId, account: string, activityId: number) => {
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
    const res = await pool.query(query, params)
    console.log(res.rows)
    await updateUnreadNotifications(account)
  } catch (err) {
    console.log(err.stack);
  }
}

export const fillActivityStreamWithPostFollowers = async (postId: PostId, account: string, activityId: number) => {
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
    const res = await pool.query(query, params)
    console.log(res.rows)
    await updateUnreadNotifications(account)
  } catch (err) {
    console.log(err.stack);
  }
}

export const fillActivityStreamWithCommentFollowers = async (commentId: CommentId, account: string, activityId: number) => {
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
    const res = await pool.query(query, params)
    console.log(res.rows)
    await updateUnreadNotifications(account)
  } catch (err) {
    console.log(err.stack);
  }
}
