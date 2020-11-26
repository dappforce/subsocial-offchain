import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

const query = `
  INSERT INTO df.space_followers(follower_account, following_space_id)
    VALUES($1, $2)
  RETURNING *`

export async function insertSpaceFollower(data: EventData) {
  const spaceId = encodeStructId(data[1].toString());
  const params = [ data[0].toString(), spaceId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, insertSpaceFollower)
  }
};