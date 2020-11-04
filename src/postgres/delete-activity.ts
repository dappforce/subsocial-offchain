import { pg } from '../connections/connect-postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { tryPgQeury } from './postges-logger';

export const deleteNotificationsAboutComment = async (userId: string, commentId: PostId) => {
  const query = `
      DELETE FROM df.notifications
      WHERE account = $1
        AND (block_number, event_index) IN
          (SELECT block_number, event_index
          FROM df.activities
          LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_comment_id WHERE comment_id = $2)
      RETURNING *`
  const encodedCommentId = encodeStructId(commentId);
  const params = [ userId, encodedCommentId ];

  await tryPgQeury(
    async () => await pg.query(query, params),
    {
      success: 'DeleteNotificationsAboutComment function worked successfully',
      error: 'DeleteNotificationsAboutComment function failed: '
    }
  )
}

export const deleteNotificationsAboutAccount = async (userId: string, accountId: string) => {
  const query = `
      DELETE FROM df.notifications
      WHERE account = $1
        AND (block_number, event_index) IN
          (SELECT block_number, event_index
          LEFT JOIN df.accountblock_number_followers
          ON df.activities.account = df.account_followers.following_account
          WHERE account = $2)
      RETURNING *`
  const params = [ userId, accountId ];
  
  await tryPgQeury(
    async () => await pg.query(query, params),
    {
      success: 'DeleteNotificationsAboutAccount function worked successfully',
      error: 'DeleteNotificationsAboutAccount function failed: '
    }
  )
}

export const deleteNotificationsAboutPost = async (userId: string, postId: PostId) => {
  const query = `
      DELETE FROM df.notifications
      WHERE account = $1 
        AND (block_number, event_index) IN
          (SELECT block_number, event_index
          FROM df.activities
          LEFT JOIN df.post_followers ON df.activities.post_id = df.post_followers.following_post_id
          WHERE post_id = $2)
      RETURNING *`
  const encodedPostId = encodeStructId(postId);
  const params = [ userId, encodedPostId ];
  
  await tryPgQeury(
    async () => await pg.query(query, params),
    {
      success: 'DeleteNotificationsAboutPost function worked successfully',
      error: 'DeleteNotificationsAboutPost function failed: '
    }
  )
}

export const deleteNotificationsAboutSpace = async (userId: string, spaceId: SpaceId) => {
  const query = `
      DELETE FROM df.notifications
      WHERE account = $1
        AND (block_number, event_index) IN
          (SELECT block_number, event_index
          FROM df.activities
          LEFT JOIN df.space_followers ON df.activities.space_id = df.space_followers.following_space_id
          WHERE space_id = $2)
      RETURNING *`
  const encodedSpaceId = encodeStructId(spaceId);
  const params = [ userId, encodedSpaceId ];
  
  await tryPgQeury(
    async () => await pg.query(query, params),
    {
      success: 'DeleteNotificationsAboutSpace function worked successfully',
      error: 'DeleteNotificationsAboutSpace function failed: '
    }
  )
}
