import { GenericEventData } from '@polkadot/types';
import { newPgError, runQuery } from '../utils';
import { IQueryParams } from '../types/deleteAccountFollower.queries';

const query = `
  DELETE from df.account_followers
  WHERE follower_account = :followerAccount
    AND following_account = :followingAccount
  RETURNING *`

export async function deleteAccountFollower (data: GenericEventData) {
  const params = { followerAccount: data[0].toString(), followingAccount: data[1].toString() };

  try {
    await runQuery<IQueryParams>(query, params)

  } catch (err) {
    throw newPgError(err, deleteAccountFollower)
  }
}