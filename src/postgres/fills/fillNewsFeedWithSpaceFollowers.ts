import { ActivitiesParamsWithAccount } from '../queries/types';
import { fillTableWith } from './fillTableQueries';
import { encodeStructId } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { IQueryParams } from '../types/fillNewsFeedWithSpaceFollowers.queries';
import { informTelegramClientAboutNotifOrFeed } from '../../express-api/events';
import { isEmptyArray } from '@subsocial/utils';

export async function fillNewsFeedWithSpaceFollowers(spaceId: string, { account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const query = fillTableWith("news_feed", "space")
  const encodedSpaceId = encodeStructId(spaceId);
  const encodedBlockNumber = encodeStructId(blockNumber.toString())
  const params = { spaceId: encodedSpaceId, account, blockNumber: encodedBlockNumber, eventIndex };

  try {
    const result = await runQuery<IQueryParams>(query, params)
    await updateCountOfUnreadNotifications(account)
    if (!isEmptyArray(result.rows)) {
      result.rows.map((feed) =>
        informTelegramClientAboutNotifOrFeed(account, feed.account, blockNumber, eventIndex, 'feed')
      )
    }
  } catch (err) {
    throw newPgError(err, fillNewsFeedWithSpaceFollowers)
  }
}