import { EventData } from '@polkadot/types/generic/Event';
import { pg } from '../connections/postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { newPgError } from './utils';

export const insertAccountFollower = async (data: EventData) => {
  const query = `
    INSERT INTO df.account_followers(follower_account, following_account)
      VALUES($1, $2)
    RETURNING *`;

  const params = [ data[0].toString(), data[1].toString() ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, insertAccountFollower)
  }
};

export const insertPostFollower = async (data: EventData) => {
  const query = `
    INSERT INTO df.post_followers(follower_account, following_post_id)
      VALUES($1, $2)
    RETURNING *`

  const postId = encodeStructId(data[1] as PostId);
  const params = [ data[0].toString(), postId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, insertPostFollower)
  }
};

export const insertCommentFollower = async (data: EventData) => {
  const query = `
    INSERT INTO df.comment_followers(follower_account, following_comment_id)
      VALUES($1, $2)
    RETURNING *`

  const commentId = encodeStructId(data[1] as PostId);
  const params = [ data[0].toString(), commentId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, insertCommentFollower)
  }
};

export const insertSpaceFollower = async (data: EventData) => {
  const query = `
    INSERT INTO df.space_followers(follower_account, following_space_id)
      VALUES($1, $2)
    RETURNING *`

  const spaceId = encodeStructId(data[1] as SpaceId);
  const params = [ data[0].toString(), spaceId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, insertSpaceFollower)
  }
};
