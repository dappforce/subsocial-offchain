import { newPgError, runQuery } from '../utils';
import { encodeStructId } from '../../substrate/utils';
import { EventData } from '@polkadot/types/generic/Event';
import { IQueryParams, IQueryQuery } from '../types/deletePostFollower.queries';
import { sql } from '@pgtyped/query';

const query = sql<IQueryQuery>`
  DELETE from df.post_followers
  WHERE follower_account = $followerAccount
    AND following_post_id = $followingPostId
  RETURNING *`

export async function deletePostFollower (data: EventData) {
  const postId = encodeStructId(data[1].toString());
  const params: IQueryParams = { followerAccount: data[0].toString(), followingPostId: postId };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, deletePostFollower)
  }
};