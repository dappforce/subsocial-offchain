import { fillAccountFollowerQuery } from './fillTableQueries';
import { newPgError, runQuery } from '../utils';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { IQueryParams } from '../types/fillNotificationsWithAccountFollowers.queries';
import { encodeStructId } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { informTelegramClientAboutNotifOrFeed } from '../../express-api/events';

export async function fillNotificationsWithAccountFollowers({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const query = fillAccountFollowerQuery("notifications")
  const encodedBlockNumber = encodeStructId(blockNumber.toString())
  const params: IQueryParams = { account, blockNumber: encodedBlockNumber, eventIndex };

  try {
    const result = await runQuery<IQueryParams>(query, params)
    await updateCountOfUnreadNotifications(account)
    if (!isEmptyArray(result.rows)) {
      result.rows.map(async (notification) => {
        informTelegramClientAboutNotifOrFeed(account, notification.account, blockNumber, eventIndex, 'notification')
      })
    }
  } catch (err) {
    throw newPgError(err, fillNotificationsWithAccountFollowers)
  }
}