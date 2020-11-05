import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';
import { encodeStructId } from '../../substrate/utils';
import { EventData } from '@polkadot/types/generic/Event';
import { PostId } from '@subsocial/types/substrate/interfaces';

export const deletePostFollower = async (data: EventData) => {
  const query = `
    DELETE from df.post_followers
    WHERE follower_account = $1
      AND following_post_id = $2
    RETURNING *`

  const postId = encodeStructId(data[1] as PostId);
  const params = [ data[0].toString(), postId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deletePostFollower)
  }
};