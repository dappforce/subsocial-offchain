import { pg } from '../connections/connect-postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { updateCountOfUnreadNotifications } from './notifications';
import { fillNotificationsLog, fillNewsFeedLog, fillNewsFeedLogError, fillNotificationsLogError } from './postges-logger';
import BN from 'bn.js';

export const fillNewsFeedWithAccountFollowers = async (account: string, eventIndex: number, activityAccount: string, blockNumber: BN ) => {
  const query = `
      INSERT INTO df.news_feed (account, event_index, activity_account, block_number)
        (SELECT df.account_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number
        FROM df.activities
        LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
        WHERE df.account_followers.follower_account <> $1
          AND event_index = $2
          AND account = $3
          AND block_number = $4
          AND (df.account_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number)
          NOT IN (SELECT account, event_index, activity_account, block_number from df.news_feed))
      RETURNING *`
  const params = [ account, eventIndex, activityAccount, blockNumber ];
  try {
    await pg.query(query, params)
    fillNewsFeedLog('account')
  } catch (err) {
    fillNewsFeedLogError('account', err.stack);
    throw err
  }
}

export const fillNotificationsWithAccountFollowers = async (account: string, eventIndex: number, activityAccount: string, blockNumber: BN) => {
  const query = `
      INSERT INTO df.notifications (account, event_index, activity_account, block_number)
        (SELECT df.account_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number
        FROM df.activities
        LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
        WHERE df.account_followers.follower_account <> $1
          AND event_index = $2
          AND account = $3
          AND block_number = $4
          AND (df.account_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number)
          NOT IN (SELECT account, event_index, activity_account, block_number from df.notifications))
      RETURNING *`
  const params = [ account, eventIndex, activityAccount, blockNumber ];
  try {
    await pg.query(query, params)
    fillNotificationsLog('account')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    fillNotificationsLogError('account', err.stack);
    throw err
  }
}

export const fillNewsFeedWithSpaceFollowers = async (spaceId: SpaceId, account: string, eventIndex: number, activityAccount: string, blockNumber: BN) => {
  const query = `
      INSERT INTO df.news_feed(account, event_index, activity_account, block_number)
        (SELECT df.space_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number
        FROM df.activities
        LEFT JOIN df.space_followers ON df.activities.space_id = df.space_followers.following_space_id
        WHERE space_id = $1
          AND df.space_followers.follower_account <> $2
          AND event_index = $3
          AND account = $4
          AND block_number = $5
          AND aggregated = true
          AND (df.space_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number)
            NOT IN (SELECT account, event_index, activity_account, block_number from df.news_feed))
      RETURNING *`;
  const encodedSpaceId = encodeStructId(spaceId);
  const params = [ encodedSpaceId, account, eventIndex, activityAccount, blockNumber ];
  try {
    await pg.query(query, params)
    fillNewsFeedLog('space')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    fillNewsFeedLogError('space', err.stack);
    throw err
  }
}

export const fillNotificationsWithPostFollowers = async (postId: PostId, account: string, eventIndex: number, activityAccount: string, blockNumber: BN) => {
  const query = `
      INSERT INTO df.notifications(account, event_index, activity_account, block_number)
        (SELECT df.post_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number
        FROM df.activities
        LEFT JOIN df.post_followers ON df.activities.post_id = df.post_followers.following_post_id
        WHERE post_id = $1
          AND event_index = $3
          AND account = $4
          AND block_number = $5 
          AND aggregated = true 
          AND parent_comment_id IS NULL
          AND df.post_followers.follower_account <> $2
          AND (df.post_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number)
          NOT IN (SELECT account, event_index, activity_account, block_number from df.notifications))
      RETURNING *`
  const encodedPostId = encodeStructId(postId);
  const params = [ encodedPostId, account, eventIndex, activityAccount, blockNumber ];
  try {
    await pg.query(query, params)
    fillNotificationsLog('post')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    fillNotificationsLogError('post', err.stack);
    throw err
  }
}

export const fillNotificationsWithCommentFollowers = async (commentId: PostId, account: string, eventIndex: number, activityAccount: string, blockNumber: BN) => {
  const query = `
      INSERT INTO df.notifications(account, event_index, activity_account, block_number)
        (SELECT df.comment_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number
        FROM df.activities
        LEFT JOIN df.comment_followers ON df.activities.comment_id = df.comment_followers.following_comment_id 
        WHERE comment_id = $1 
          AND event_index = $3
          AND account = $4
          AND block_number = $5 
          AND aggregated = true
          AND df.comment_followers.follower_account <> $2
          AND (df.comment_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number)
          NOT IN (SELECT account, event_index, activity_account, block_number from df.notifications))
      RETURNING *`
  const encodedCommentId = encodeStructId(commentId);
  const params = [ encodedCommentId, account, eventIndex, activityAccount, blockNumber ];
  try {
    await pg.query(query, params)
    fillNotificationsLog('comment')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    fillNotificationsLogError('comment', err.stack);
    throw err
  }
}
