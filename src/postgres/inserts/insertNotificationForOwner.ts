import { newPgError, runQuery } from '../utils';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/insertNotificationForOwner.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.notifications
    VALUES($account, $blockNumber, $eventIndex)
  RETURNING *`

export async function insertNotificationForOwner({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const params: IQueryParams = { account, blockNumber, eventIndex }

  try {
    await runQuery(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, insertNotificationForOwner)
  }
}