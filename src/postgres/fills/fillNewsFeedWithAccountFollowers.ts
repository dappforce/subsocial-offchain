import { newPgError, runQuery } from '../utils';
// import { fillAccountFollowerQuery } from './fillTableQueries';
import { ActivitiesParamsWithAccount } from '../queries/types';
// import { pg } from '../../connections/postgres';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/fillNewsFeedWithAccountFollowers.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.news_feed (account, block_number, event_index)
  (SELECT df.account_followers.follower_account, df.activities.block_number, df.activities.event_index
  FROM df.activities
  LEFT JOIN df.account_followers ON df.activities.account = df.account_followers.following_account
  WHERE df.account_followers.follower_account <> $account
    AND block_number = $blockNumber
    AND event_index = $eventIndex
    AND (df.account_followers.follower_account, df.activities.block_number, df.activities.event_index)
    NOT IN (SELECT account, block_number, event_index from df.news_feed))
  RETURNING *`

export async function fillNewsFeedWithAccountFollowers({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  //const query = sql.apply(fillAccountFollowerQuery("news_feed"))
  const params: IQueryParams = { account, blockNumber, eventIndex };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, fillNewsFeedWithAccountFollowers)
  }
}