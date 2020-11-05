import { EventData } from '@polkadot/types/generic/Event';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

const query = `
  DELETE from df.account_followers
  WHERE follower_account = $1
    AND following_account = $2
  RETURNING *`

export async function deleteAccountFollower (data: EventData) {
  const params = [ data[0].toString(), data[1].toString() ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteAccountFollower)
  }
}