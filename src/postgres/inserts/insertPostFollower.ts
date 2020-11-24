import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/insertPostFollower.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.post_followers(follower_account, following_post_id)
    VALUES($followerAccount, $followingPostId)
  RETURNING *`

export async function insertPostFollower(data: EventData) {
  const postId = encodeStructId(data[1].toString());
  const params: IQueryParams = { followerAccount: data[0].toString(), followingPostId: postId };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, insertPostFollower)
  }
};