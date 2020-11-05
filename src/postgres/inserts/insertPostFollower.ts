import { EventData } from '@polkadot/types/generic/Event';
import { PostId } from '@subsocial/types/substrate/interfaces';
import { encodeStructId } from '../../substrate/utils';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

export const insertPostFollower = async (data: EventData) => {
  const query = `
    INSERT INTO df.post_followers(follower_account, following_post_id)
      VALUES($1, $2)
    RETURNING *`

  const postId = encodeStructId(data[1] as PostId);
  const params = [ data[0].toString(), postId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, insertPostFollower)
  }
};