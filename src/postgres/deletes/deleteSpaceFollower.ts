import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { pg } from '../../connections/postgres';
import { newPgError } from '../utils';

const query = `
  DELETE from df.space_followers
  WHERE follower_account = $1
    AND following_space_id = $2
  RETURNING *`

export async function deleteSpaceFollower (data: EventData) {
  const spaceId = encodeStructId(data[1].toString());
  const params = [ data[0].toString(), spaceId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteSpaceFollower)
  }
};