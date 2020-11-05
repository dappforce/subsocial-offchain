import { EventData } from '@polkadot/types/generic/Event';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

export const insertAccountFollower = async (data: EventData) => {
  const query = `
    INSERT INTO df.account_followers(follower_account, following_account)
      VALUES($1, $2)
    RETURNING *`;

  const params = [ data[0].toString(), data[1].toString() ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, insertAccountFollower)
  }
};