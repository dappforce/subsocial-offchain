import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryParams, IQueryQuery } from '../types/deleteCommentFollower.queries';

const query = sql<IQueryQuery>`
  DELETE from df.comment_followers
  WHERE follower_account = $followerAccount
    AND following_comment_id = $followingCommentId
  RETURNING *`

export async function deleteCommentFollower (data: EventData) {
  const commentId = encodeStructId(data[1].toString());
  const params: IQueryParams = { followerAccount: data[0].toString(), followingCommentId: commentId };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, deleteCommentFollower)
  }
};