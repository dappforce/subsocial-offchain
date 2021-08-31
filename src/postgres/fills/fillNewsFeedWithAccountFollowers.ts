import { newPgError, runQuery } from '../utils';
import { fillAccountFollowerQuery } from './fillTableQueries';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { IQueryParams } from '../types/fillNewsFeedWithAccountFollowers.queries';
import { encodeStructId } from '../../substrate/utils';

export async function fillNewsFeedWithAccountFollowers({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const query = fillAccountFollowerQuery("news_feed")
  const encodedBlockNumber = encodeStructId(blockNumber.toString())

  const params = { account, blockNumber: encodedBlockNumber, eventIndex };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, fillNewsFeedWithAccountFollowers)
  }
}