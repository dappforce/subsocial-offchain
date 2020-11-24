import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/insertSpaceFollower.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.space_followers(follower_account, following_space_id)
    VALUES($followerAccount, $followingSpaceId)
  RETURNING *`

export async function insertSpaceFollower(data: EventData) {
  const spaceId = encodeStructId(data[1].toString());
  const params: IQueryParams = { followerAccount: data[0].toString(), followingSpaceId: spaceId };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, insertSpaceFollower)
  }
};