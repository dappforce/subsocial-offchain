import { fillAccountFollowerQuery } from './fillTableQueries';
import { updateCountOfUnreadNotifications } from '../notifications';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';
import { ActivitiesParamsWithAccount } from '../queries/types';

export const fillNotificationsWithAccountFollowers = async ({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) => {
  const query = fillAccountFollowerQuery("notifications")
  const params = [account, blockNumber, eventIndex];

  try {
    await pg.query(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, fillNotificationsWithAccountFollowers)
  }
}