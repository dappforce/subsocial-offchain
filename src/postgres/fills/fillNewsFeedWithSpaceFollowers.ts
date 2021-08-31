import { ActivitiesParamsWithAccount } from '../queries/types';
import { fillTableWith } from './fillTableQueries';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { IQueryParams } from '../types/fillNewsFeedWithSpaceFollowers.queries';

export async function fillNewsFeedWithSpaceFollowers(spaceId: string, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const query = fillTableWith("news_feed", "space")
  const encodedSpaceId = encodeStructId(spaceId);
  const encodedBlockNumber = encodeStructId(blockNumber.toString())
  const params = { spaceId: encodedSpaceId, account, blockNumber: encodedBlockNumber, eventIndex };

  try {
    await runQuery<IQueryParams>(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNewsFeedWithSpaceFollowers)
  }
}