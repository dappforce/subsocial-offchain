import { ActivitiesParamsWithAccount } from '../queries/types';
// import { fillTableWith } from './fillTableQueries';
import { encodeStructId } from '../../substrate/utils';
// import { pg } from '../../connections/postgres';
import { newPgError, runQuery } from '../utils';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/fillNewsFeedWithSpaceFollowers.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.news_feed (account, block_number, event_index)
  (SELECT df.space_followers.follower_account, df.activities.block_number, df.activities.event_index
  FROM df.activities
  LEFT JOIN df.space_followers ON df.activities.space_id = df.space_followers.following_space_id
  WHERE space_id = $spaceId
    AND df.space_followers.follower_account <> $account
    AND block_number = $blockNumber
    AND event_index = $eventIndex
    AND aggregated = true
    AND (df.space_followers.follower_account, df.activities.block_number, df.activities.event_index)
      NOT IN (SELECT account, block_number, event_index from df.news_feed))
  RETURNING *;`

export async function fillNewsFeedWithSpaceFollowers(spaceId: string, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  // const query = fillTableWith("news_feed", "space")
  const encodedSpaceId = encodeStructId(spaceId);
  const params: IQueryParams = { spaceId: encodedSpaceId, account, blockNumber, eventIndex };

  try {
    await runQuery(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNewsFeedWithSpaceFollowers)
  }
}