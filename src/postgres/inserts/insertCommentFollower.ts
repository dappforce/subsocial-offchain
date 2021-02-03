import { GenericEventData } from '@polkadot/types';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { IQueryParams } from '../types/insertCommentFollower.queries';

const query = `
  INSERT INTO df.comment_followers(follower_account, following_comment_id)
    VALUES(:followerAccount, :followingCommentId)
  RETURNING *`

export async function insertCommentFollower(data: GenericEventData) {
  const commentId = encodeStructId(data[1].toString());
  const params = { followerAccount: data[0].toString(), followingCommentId: commentId };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, insertCommentFollower)
  }
};