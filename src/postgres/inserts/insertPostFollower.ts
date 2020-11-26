import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

const query = `
  INSERT INTO df.post_followers(follower_account, following_post_id)
    VALUES($1, $2)
  RETURNING *`

export async function insertPostFollower(data: EventData) {
  const postId = encodeStructId(data[1].toString());
  const params = [ data[0].toString(), postId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, insertPostFollower)
  }
};