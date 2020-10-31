import { pg } from '../connections/connect-postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { updateCountOfUnreadNotifications } from './notifications';
import { fillNotificationsLog, fillNewsFeedLog, fillNewsFeedLogError, fillNotificationsLogError } from './postges-logger';
import BN from 'bn.js';

const fillAccountFollowerQuery = (table: string) => {
  return `
  INSERT INTO df.${table} (account, event_index, activity_account, block_number)
    (SELECT df.account_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number
    FROM df.activities
    LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
    WHERE df.account_followers.follower_account <> $1
      AND event_index = $2
      AND account = $3
      AND block_number = $4
      AND (df.account_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number)
      NOT IN (SELECT account, event_index, activity_account, block_number from df.${table}))
  RETURNING *`
}

const fillTableWith = (table: string, object: string) => {
  let parent_comment_id = "";
  if(object == "post") parent_comment_id = "AND parent_comment_id IS NULL"

  return `
  INSERT INTO df.${table} (account, event_index, activity_account, block_number)
    (SELECT df.${object}_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number
    FROM df.activities
    LEFT JOIN df.${object}_followers ON df.activities.${object}_id = df.${object}_followers.following_${object}_id
    WHERE ${object}_id = $1
      AND df.${object}_followers.follower_account <> $2
      AND event_index = $3
      AND account = $4
      AND block_number = $5
      AND aggregated = true
      ${parent_comment_id}
      AND (df.${object}_followers.follower_account, df.activities.event_index, df.activities.account, df.activities.block_number)
        NOT IN (SELECT account, event_index, activity_account, block_number from df.${table}))
  RETURNING *;
  `
}

export const fillNewsFeedWithAccountFollowers = async (account: string, eventIndex: number, activityAccount: string, blockNumber: BN ) => {
  const query = fillAccountFollowerQuery("news_feed")

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
  const query = fillAccountFollowerQuery("notifications")

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
  const query = fillTableWith("news_feed", "space")

  const encodedSpaceId = encodeStructId(spaceId);
  const params = [ encodedSpaceId, account, eventIndex, activityAccount, blockNumber ];
  console.log("Params for insert post: ", params)
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
  const query = fillTableWith("notifications", "post")

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
  const query = fillTableWith("notifications", "comment")

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
