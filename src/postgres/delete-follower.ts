import { EventData } from '@polkadot/types/generic/Event';
import { pg } from '../connections/postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteFollowersLog, deleteFollowersLogError } from './postges-logger';

export const deletePostFollower = async (data: EventData) => {
  const postId = encodeStructId(data[1] as PostId);
  const query = `
      DELETE from df.post_followers
      WHERE follower_account = $1
        AND following_post_id = $2
      RETURNING *`
  const params = [ data[0].toString(), postId ];
  try {
    await pg.query(query, params)
    deleteFollowersLog('post')
  } catch (err) {
    deleteFollowersLogError('post', err.stack)
    throw err
  }
};

export const deleteCommentFollower = async (data: EventData) => {
  const commentId = encodeStructId(data[1] as PostId);
  const query = `
      DELETE from df.comment_followers
      WHERE follower_account = $1
        AND following_comment_id = $2
      RETURNING *`
  const params = [ data[0].toString(), commentId ];
  try {
    await pg.query(query, params)
    deleteFollowersLog('comment')
  } catch (err) {
    deleteFollowersLogError('comment', err.stack)
    throw err
  }
};

export const deleteSpaceFollower = async (data: EventData) => {
  const spaceId = encodeStructId(data[1] as SpaceId);
  const query = `
      DELETE from df.space_followers
      WHERE follower_account = $1
        AND following_space_id = $2
      RETURNING *`
  const params = [ data[0].toString(), spaceId ];
  try {
    await pg.query(query, params)
    deleteFollowersLog('space')
  } catch (err) {
    deleteFollowersLogError('space', err.stack)
    throw err
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
    deleteFollowersLog('account')
  } catch (err) {
    deleteFollowersLogError('account', err.stack)
    throw err
  }
};
