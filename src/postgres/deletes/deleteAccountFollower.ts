import { EventData } from '@polkadot/types/generic/Event';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

export const deleteAccountFollower = async (data: EventData) => {
  const query = `
    DELETE from df.account_followers
    WHERE follower_account = $1
      AND following_account = $2
    RETURNING *`

  const params = [ data[0].toString(), data[1].toString() ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteAccountFollower)
  }
}