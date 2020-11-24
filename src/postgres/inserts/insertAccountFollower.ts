import { EventData } from '@polkadot/types/generic/Event';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/insertAccountFollower.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.account_followers(follower_account, following_account)
    VALUES($followerAccount, $followingAccount)
  RETURNING *`;

export async function insertAccountFollower(data: EventData) {
  const params: IQueryParams = { followerAccount: data[0].toString(), followingAccount: data[1].toString() };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, insertAccountFollower)
  }
};