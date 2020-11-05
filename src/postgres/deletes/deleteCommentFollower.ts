import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';
import { PostId } from '@subsocial/types/substrate/interfaces';

const query = `
  DELETE from df.comment_followers
  WHERE follower_account = $1
    AND following_comment_id = $2
  RETURNING *`

export async function deleteCommentFollower (data: EventData) {
  const commentId = encodeStructId(data[1] as PostId);
  const params = [ data[0].toString(), commentId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteCommentFollower)
  }
};