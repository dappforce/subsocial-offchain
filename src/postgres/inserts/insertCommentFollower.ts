import { EventData } from '@polkadot/types/generic/Event';
import { PostId } from '@subsocial/types/substrate/interfaces';
import { encodeStructId } from '../../substrate/utils';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

export const insertCommentFollower = async (data: EventData) => {
  const query = `
    INSERT INTO df.comment_followers(follower_account, following_comment_id)
      VALUES($1, $2)
    RETURNING *`

  const commentId = encodeStructId(data[1] as PostId);
  const params = [ data[0].toString(), commentId ];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, insertCommentFollower)
  }
};