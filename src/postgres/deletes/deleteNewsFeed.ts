import { GenericEventData } from '@polkadot/types';
import { newPgError, runQuery } from '../utils';
import { encodeStructId } from '../../substrate/utils';

const query = `
DELETE FROM df.news_feed
WHERE (block_number, event_index) IN (SELECT block_number, event_index FROM df.activities WHERE space_id = :spaceId) AND account = :account
RETURNING *`

export async function deletePostsOfUnfollowedSpaceFromFeed(data: GenericEventData) {
  const spaceId = encodeStructId(data[1].toString());
  const params = { account: data[0].toString(), spaceId };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, deletePostsOfUnfollowedSpaceFromFeed)
  }
};