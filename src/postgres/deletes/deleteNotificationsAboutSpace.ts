import { encodeStructId } from '../../substrate/utils';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';
import { SpaceId } from '@subsocial/types/substrate/interfaces';

export const deleteNotificationsAboutSpace = async (userId: string, spaceId: SpaceId) => {
  const query = `
    DELETE FROM df.notifications
    WHERE account = $1
      AND (block_number, event_index) IN (
        SELECT block_number, event_index
        FROM df.activities
        LEFT JOIN df.space_followers
        ON df.activities.space_id = df.space_followers.following_space_id
        WHERE space_id = $2
      )
    RETURNING *`

  const encodedSpaceId = encodeStructId(spaceId);
  const params = [ userId, encodedSpaceId ];
  
  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, deleteNotificationsAboutSpace)
  }
}