import { EventData } from '@polkadot/types/generic/Event';
import { pg } from '../connections/postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { newPgError } from './utils';

export const deletePostFollower = async (data: EventData) => {
  const query = `
    DELETE from df.post_followers
    WHERE follower_account = $1
      AND following_post_id = $2
    RETURNING *`

  const postId = encodeStructId(data[1] as PostId);
  const params = [ data[0].toString(), postId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deletePostFollower)
  }
};

export const deleteCommentFollower = async (data: EventData) => {
  const query = `
    DELETE from df.comment_followers
    WHERE follower_account = $1
      AND following_comment_id = $2
    RETURNING *`

  const commentId = encodeStructId(data[1] as PostId);
  const params = [ data[0].toString(), commentId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteCommentFollower)
  }
};

export const deleteSpaceFollower = async (data: EventData) => {
  const query = `
    DELETE from df.space_followers
    WHERE follower_account = $1
      AND following_space_id = $2
    RETURNING *`

  const spaceId = encodeStructId(data[1] as SpaceId);
  const params = [ data[0].toString(), spaceId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteSpaceFollower)
  }
};

export const deleteAccountFollower = async (data: EventData) => {
  const query = `
    DELETE from df.account_followers
    WHERE follower_account = $1
      AND following_account = $2
    RETURNING *`

  const params = [ data[0].toString(), data[1].toString() ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteAccountFollower)
  }
}
