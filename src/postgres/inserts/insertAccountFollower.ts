import { GenericEventData } from '@polkadot/types';
import { newPgError, runQuery } from '../utils';
import { IQueryParams } from '../types/insertAccountFollower.queries';

const query = `
  INSERT INTO df.account_followers(follower_account, following_account)
    VALUES(:followerAccount, :followingAccount)
  RETURNING *`;

export async function insertAccountFollower(data: GenericEventData) {
  const params = { followerAccount: data[0].toString(), followingAccount: data[1].toString() };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, insertAccountFollower)
  }
};