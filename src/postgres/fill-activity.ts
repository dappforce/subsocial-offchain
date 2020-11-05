import { pg } from '../connections/postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { updateCountOfUnreadNotifications } from './notifications';
import { tryPgQuery } from './postges-logger';
import { ActivitiesParamsWithAccount } from './queries/types';

const fillAccountFollowerQuery = (table: string) => {
  return `
  INSERT INTO df.${table} (account, block_number, event_index)
    (SELECT df.account_followers.follower_account, df.activities.block_number, df.activities.event_index
    FROM df.activities
    LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
    WHERE df.account_followers.follower_account <> $1
      AND block_number = $2
      AND event_index = $3
      AND (df.account_followers.follower_account, df.activities.block_number, df.activities.event_index)
      NOT IN (SELECT account, block_number, event_index from df.${table}))
  RETURNING *`
}

const fillTableWith = (table: string, object: string) => {
  let parent_comment_id = "";
  if (object == "post") parent_comment_id = "AND parent_comment_id IS NULL"

  return `
  INSERT INTO df.${table} (account, block_number, event_index)
    (SELECT df.${object}_followers.follower_account, df.activities.block_number, df.activities.event_index
    FROM df.activities
    LEFT JOIN df.${object}_followers ON df.activities.${object}_id = df.${object}_followers.following_${object}_id
    WHERE ${object}_id = $1
      AND df.${object}_followers.follower_account <> $2
      AND block_number = $3
      AND event_index = $4
      AND aggregated = true
      ${parent_comment_id}
      AND (df.${object}_followers.follower_account, df.activities.block_number, df.activities.event_index)
        NOT IN (SELECT account, block_number, event_index from df.${table}))
  RETURNING *;
  `
}

export const fillNewsFeedWithAccountFollowers = async ({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) => {
  const query = fillAccountFollowerQuery("news_feed")

  const params = [account, blockNumber, eventIndex];

  await tryPgQuery(
    () => pg.query(query, params),
    {
      success: 'FillNewsFeedWithAccountFollowers function worked successfully',
      error: 'FillNewsFeedWithAccountFollowers function failed: '
    }
  )
}

export const fillNotificationsWithAccountFollowers = async ({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) => {
  const query = fillAccountFollowerQuery("notifications")

  const params = [account, blockNumber, eventIndex];
  
  await tryPgQuery(
    async () => { 
      await pg.query(query, params)
      await updateCountOfUnreadNotifications(account)
    },
    {
      success: 'FillNotificationsWithAccountFollowers function worked successfully',
      error: 'FillNotificationsWithAccountFollowers function failed: '
    }
  )
}

export const fillNewsFeedWithSpaceFollowers = async (spaceId: SpaceId, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) => {
  const query = fillTableWith("news_feed", "space")

  const encodedSpaceId = encodeStructId(spaceId);
  const params = [encodedSpaceId, account, blockNumber, eventIndex];
  
  await tryPgQuery(
    async () => {
      await pg.query(query, params)
      await updateCountOfUnreadNotifications(account)
    },
    {
      success: 'FillNewsFeedWithSpaceFollowers function worked successfully',
      error: 'FillNewsFeedWithSpaceFollowers function failed: '
    }
  )
}

export const fillNotificationsWithPostFollowers = async (postId: PostId, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) => {
  const query = fillTableWith("notifications", "post")

  const encodedPostId = encodeStructId(postId);
  const params = [encodedPostId, account, blockNumber, eventIndex];
  
  await tryPgQuery(
    async () => {
      await pg.query(query, params)
      await updateCountOfUnreadNotifications(account)
    },
    {
      success: 'FillNotificationsWithPostFollowers function worked successfully',
      error: 'FillNotificationsWithPostFollowers function failed: '
    }
  )
}

export const fillNotificationsWithCommentFollowers = async (commentId: PostId, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) => {
  const query = fillTableWith("notifications", "comment")

  const encodedCommentId = encodeStructId(commentId);
  const params = [encodedCommentId, account, blockNumber, eventIndex];
  
  await tryPgQuery(
    async () => {
      await pg.query(query, params)
      await updateCountOfUnreadNotifications(account)
    },
    {
      success: 'FillNotificationsWithCommentFollowers function worked successfully',
      error: 'FillNotificationsWithCommentFollowers function failed: '
    }
  )
}
