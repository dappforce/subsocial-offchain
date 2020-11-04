import { pg } from '../connections/postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { updateCountOfUnreadNotifications } from './notifications';
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
    await pg.query(query, params)
    fillNewsFeedLog('account')
  } catch (err) {
    fillNewsFeedLogError('account', err.stack);
    throw err
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
    await pg.query(query, params)
    fillNotificationsLog('account')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    fillNotificationsLogError('account', err.stack);
    throw err
  }
}

export const fillNewsFeedWithSpaceFollowers = async (spaceId: SpaceId, account: string, activityId: number) => {
  const query = `
      INSERT INTO df.news_feed(account, activity_id)
        (SELECT df.space_followers.follower_account, df.activities.id
        FROM df.activities
        LEFT JOIN df.space_followers ON df.activities.space_id = df.space_followers.following_space_id
        WHERE space_id = $1
          AND df.space_followers.follower_account <> $2
          AND id = $3
          AND aggregated = true
          AND (df.space_followers.follower_account, df.activities.id)
            NOT IN (SELECT account,activity_id from df.news_feed))
      RETURNING *`;
  const hexSpaceId = encodeStructId(spaceId);
  const params = [ hexSpaceId, account, activityId ];
  try {
    await pg.query(query, params)
    fillNewsFeedLog('space')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    fillNewsFeedLogError('space', err.stack);
    throw err
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
    await pg.query(query, params)
    fillNotificationsLog('post')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    fillNotificationsLogError('post', err.stack);
    throw err
  }
}

export const fillNotificationsWithCommentFollowers = async (commentId: PostId, account: string, activityId: number) => {
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
    await pg.query(query, params)
    fillNotificationsLog('comment')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    fillNotificationsLogError('comment', err.stack);
    throw err
  }
}
