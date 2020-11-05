import { EventData } from '@polkadot/types/generic/Event';
import { pg } from '../connections/postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { tryPgQeury } from './postges-logger';

export const insertAccountFollower = async (data: EventData) => {
  const query = `
      INSERT INTO df.account_followers(follower_account, following_account)
        VALUES($1, $2)
      RETURNING *`;
  const params = [ data[0].toString(), data[1].toString() ];
  await tryPgQeury(
    async () => await pg.query(query, params),
    {
      success: 'InsertAccountFollower function worked successfully',
      error: 'InsertAccountFollower function failed: '
    }
  )
};

export const insertPostFollower = async (data: EventData) => {
  const postId = encodeStructId(data[1] as PostId);
  const query = `
      INSERT INTO df.post_followers(follower_account, following_post_id)
        VALUES($1, $2)
      RETURNING *`
  const params = [ data[0].toString(), postId ];
 
  await tryPgQeury(
    async () => await pg.query(query, params),
    {
      success: 'InsertPostFollower function worked successfully',
      error: 'InsertPostFollower function failed: '
    }
  )
};

export const insertCommentFollower = async (data: EventData) => {
  const commentId = encodeStructId(data[1] as PostId);
  const query = `
      INSERT INTO df.comment_followers(follower_account, following_comment_id)
        VALUES($1, $2)
      RETURNING *`
  const params = [ data[0].toString(), commentId ];

  await tryPgQeury(
    async () => await pg.query(query, params),
    {
      success: 'InsertCommentFollower function worked successfully',
      error: 'InsertCommentFollower function failed: '
    }
  )
};

export const insertSpaceFollower = async (data: EventData) => {
  const spaceId = encodeStructId(data[1] as SpaceId);
  const query = `
      INSERT INTO df.space_followers(follower_account, following_space_id)
        VALUES($1, $2)
      RETURNING *`
  const params = [ data[0].toString(), spaceId ];
  await tryPgQeury(
    async () => await pg.query(query, params),
    {
      success: 'InsertSpaceFollower function worked successfully',
      error: 'InsertSpaceFollower function failed: '
    }
  )
};
