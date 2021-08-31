import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { IQueryParams } from '../types/deleteNotificationsAboutSpace.queries';

const query = `
  DELETE FROM df.notifications
  WHERE account = :account AND (block_number, event_index) IN (
    SELECT block_number, event_index
    FROM df.activities
    LEFT JOIN df.space_followers
      ON df.activities.space_id = df.space_followers.following_space_id
    WHERE space_id = :spaceId
  )
  RETURNING *`

export async function deleteNotificationsAboutSpace (userId: string, spaceId: string) {
  const encodedSpaceId = encodeStructId(spaceId);
  const params = { account: userId, spaceId: encodedSpaceId };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutSpace)
  }
}