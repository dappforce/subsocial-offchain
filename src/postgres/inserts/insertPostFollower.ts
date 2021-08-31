import { GenericEventData } from '@polkadot/types';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { IQueryParams } from '../types/insertPostFollower.queries';

const query = `
  INSERT INTO df.post_followers(follower_account, following_post_id)
    VALUES(:followerAccount, :followingPostId)
  RETURNING *`

export async function insertPostFollower(data: GenericEventData) {
  const postId = encodeStructId(data[1].toString());
  const params = { followerAccount: data[0].toString(), followingPostId: postId };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, insertPostFollower)
  }
};