import { EventData } from '@polkadot/types/generic/Event';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/insertCommentFollower.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.comment_followers(follower_account, following_comment_id)
    VALUES($followerAccount, $followingCommentId)
  RETURNING *`

export async function insertCommentFollower(data: EventData) {
  const commentId = encodeStructId(data[1].toString());
  const params: IQueryParams = { followerAccount: data[0].toString(), followingCommentId: commentId };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, insertCommentFollower)
  }
};