import { fillAccountFollowerQuery } from './fillTableQueries';
import { newPgError, runQuery } from '../utils';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { IQueryParams } from '../types/fillNotificationsWithAccountFollowers.queries';
import { encodeStructId } from '../../substrate/utils';

export async function fillNotificationsWithAccountFollowers({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const query = fillAccountFollowerQuery("notifications")
  const encodedBlockNumber = encodeStructId(blockNumber.toString())
  const params: IQueryParams = { account, blockNumber: encodedBlockNumber, eventIndex };

  try {
    await runQuery<IQueryParams>(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNotificationsWithAccountFollowers)
  }
}