import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryParams, IQueryQuery } from '../types/deleteNotificationsAboutSpace.queries';

const query = sql<IQueryQuery>`
  DELETE FROM df.notifications
  WHERE account = $account AND (block_number, event_index) IN (
    SELECT block_number, event_index
    FROM df.activities
    LEFT JOIN df.space_followers
      ON df.activities.space_id = df.space_followers.following_space_id
    WHERE space_id = $spaceId
  )
  RETURNING *`

export async function deleteNotificationsAboutSpace (userId: string, spaceId: string) {
  const encodedSpaceId = encodeStructId(spaceId);
  const params: IQueryParams = { account: userId, spaceId: encodedSpaceId };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutSpace)
  }
}