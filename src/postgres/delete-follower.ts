import { EventData } from '@polkadot/types/generic/Event';
import { pg } from '../connections/postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { tryPgQuery } from './postges-logger';

export const deletePostFollower = async (data: EventData) => {
  const postId = encodeStructId(data[1] as PostId);
  const query = `
      DELETE from df.post_followers
      WHERE follower_account = $1
        AND following_post_id = $2
      RETURNING *`
  const params = [ data[0].toString(), postId ];
  
  await tryPgQuery(
    async () => await pg.query(query, params),
    {
      success: 'DeletePostFollower function worked successfully',
      error: 'DeletePostFollower function failed: '
    }
  )
};

export const deleteCommentFollower = async (data: EventData) => {
  const commentId = encodeStructId(data[1] as PostId);
  const query = `
      DELETE from df.comment_followers
      WHERE follower_account = $1
        AND following_comment_id = $2
      RETURNING *`
  const params = [ data[0].toString(), commentId ];
  
  await tryPgQuery(
    async () => await pg.query(query, params),
    {
      success: 'DeleteCommentFollower function worked successfully',
      error: 'DeleteCommentFollower function failed: '
    }
  )
};

export const deleteSpaceFollower = async (data: EventData) => {
  const spaceId = encodeStructId(data[1] as SpaceId);
  const query = `
      DELETE from df.space_followers
      WHERE follower_account = $1
        AND following_space_id = $2
      RETURNING *`
  const params = [ data[0].toString(), spaceId ];
  
  await tryPgQuery(
    async () => await pg.query(query, params),
    {
      success: 'DeleteSpaceFollower function worked successfully',
      error: 'DeleteSpaceFollower function failed: '
    }
  )
};

export const deleteAccountFollower = async (data: EventData) => {
  const query = `
      DELETE from df.account_followers
      WHERE follower_account = $1
        AND following_account = $2
      RETURNING *`
  const params = [ data[0].toString(), data[1].toString() ];
  
  await tryPgQuery(
    async () => await pg.query(query, params),
    {
      success: 'DeleteAccountFollower function worked successfully',
      error: 'DeleteAccountFollower function failed: '
    }
  )
};
