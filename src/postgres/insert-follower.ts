import { EventData } from '@polkadot/types/generic/Event';
import { pg } from '../connections/connect-postgres';
import { encodeStructId } from '../substrate/utils';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertFollowersLog, insertFollowersLogError } from './postges-logger';

export const insertAccountFollower = async (data: EventData) => {
  const query = `
      INSERT INTO df.account_followers(follower_account, following_account)
        VALUES($1, $2)
      RETURNING *`;
  const params = [ data[0].toString(), data[1].toString() ];
  try {
    await pg.query(query, params)
    insertFollowersLog('account')
  } catch (err) {
    insertFollowersLogError('account', err.stack)
    throw err
  }
};

export const insertPostFollower = async (data: EventData) => {
  const postId = encodeStructId(data[1] as PostId);
  const query = `
      INSERT INTO df.post_followers(follower_account, following_post_id)
        VALUES($1, $2)
      RETURNING *`
  const params = [ data[0].toString(), postId ];
  try {
    await pg.query(query, params)
    insertFollowersLog('post')
  } catch (err) {
    insertFollowersLogError('post', err.stack)
    throw err
  }
};

export const insertCommentFollower = async (data: EventData) => {
  const commentId = encodeStructId(data[1] as PostId);
  const query = `
      INSERT INTO df.comment_followers(follower_account, following_comment_id)
        VALUES($1, $2)
      RETURNING *`
  const params = [ data[0].toString(), commentId ];
  try {
    await pg.query(query, params)
    insertFollowersLog('comment')
  } catch (err) {
    insertFollowersLogError('comment', err.stack)
    throw err
  }
};

export const insertSpaceFollower = async (data: EventData) => {
  const spaceId = encodeStructId(data[1] as SpaceId);
  const query = `
      INSERT INTO df.space_followers(follower_account, following_space_id)
        VALUES($1, $2)
      RETURNING *`
  const params = [ data[0].toString(), spaceId ];
  try {
    await pg.query(query, params)
    insertFollowersLog('space')
  } catch (err) {
    insertFollowersLogError('space', err.stack)
    throw err
  }
};
