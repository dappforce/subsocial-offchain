import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { IQueryParams } from '../types/deleteCommentFollower.queries';

const query = `
  DELETE from df.comment_followers
  WHERE follower_account = :followerAccount
    AND following_comment_id = :followingCommentId
  RETURNING *`

export async function deleteCommentFollower (data: EventData) {
  const commentId = encodeStructId(data[1].toString());
  const params = { followerAccount: data[0].toString(), followingCommentId: commentId };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, deleteCommentFollower)
  }
};