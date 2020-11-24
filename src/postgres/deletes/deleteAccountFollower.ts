import { EventData } from '@polkadot/types/generic/Event';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryParams, IQueryQuery } from '../types/deleteAccountFollower.queries';

const query = sql<IQueryQuery>`
  DELETE from df.account_followers
  WHERE follower_account = $followerAccount
    AND following_account = $followingAccount
  RETURNING *`

export async function deleteAccountFollower (data: EventData) {
  const params: IQueryParams  = { followerAccount: data[0].toString(), followingAccount: data[1].toString() };

  try {
    await runQuery(query, params)

  } catch (err) {
    throw newPgError(err, deleteAccountFollower)
  }
}