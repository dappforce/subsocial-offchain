import { GenericEventData } from '@polkadot/types';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { IQueryParams } from '../types/insertSpaceFollower.queries';

const query = `
  INSERT INTO df.space_followers(follower_account, following_space_id)
    VALUES(:followerAccount, :followingSpaceId)
  RETURNING *`

export async function insertSpaceFollower(data: GenericEventData) {
  const spaceId = encodeStructId(data[1].toString());
  const params = { followerAccount: data[0].toString(), followingSpaceId: spaceId };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, insertSpaceFollower)
  }
};