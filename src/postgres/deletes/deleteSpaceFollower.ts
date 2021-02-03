import { GenericEventData } from '@polkadot/types';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { IQueryParams } from '../types/deleteSpaceFollower.queries';

const query = `
  DELETE from df.space_followers
  WHERE follower_account = :followerAccount
    AND following_space_id = :followingSpaceId
  RETURNING *`

export async function deleteSpaceFollower (data: GenericEventData) {
  const spaceId = encodeStructId(data[1].toString());
  const params = { followerAccount: data[0].toString(), followingSpaceId: spaceId };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, deleteSpaceFollower)
  }
};