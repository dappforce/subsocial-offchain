import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/deleteSpaceFollower.queries';

const query = sql<IQueryQuery>`
  DELETE from df.space_followers
  WHERE follower_account = $followerAccount
    AND following_space_id = $followingSpaceId
  RETURNING *`

export async function deleteSpaceFollower (data: EventData) {
  const spaceId = encodeStructId(data[1].toString());
  const params: IQueryParams = { followerAccount: data[0].toString(), followingSpaceId: spaceId };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, deleteSpaceFollower)
  }
};