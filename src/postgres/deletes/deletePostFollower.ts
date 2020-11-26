import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';
import { encodeStructId } from '../../substrate/utils';
import { EventData } from '@polkadot/types/generic/Event';

const query = `
  DELETE from df.post_followers
  WHERE follower_account = $1
    AND following_post_id = $2
  RETURNING *`

export async function deletePostFollower (data: EventData) {
  const postId = encodeStructId(data[1].toString());
  const params = [ data[0].toString(), postId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deletePostFollower)
  }
};