import { newPgError } from '../utils';
import { fillAccountFollowerQuery } from './fillTableQueries';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { pg } from '../../connections/postgres';

export const fillNewsFeedWithAccountFollowers = async ({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) => {
  const query = fillAccountFollowerQuery("news_feed")
  const params = [account, blockNumber, eventIndex];

  try {
    pg.query(query, params)
  } catch (err) {
    throw newPgError(err, fillNewsFeedWithAccountFollowers)
  }
}