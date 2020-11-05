import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';
import { PostId } from '@subsocial/types/substrate/interfaces';

export const deleteCommentFollower = async (data: EventData) => {
  const query = `
    DELETE from df.comment_followers
    WHERE follower_account = $1
      AND following_comment_id = $2
    RETURNING *`

  const commentId = encodeStructId(data[1] as PostId);
  const params = [ data[0].toString(), commentId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteCommentFollower)
  }
};