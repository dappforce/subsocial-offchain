import { newPgError, runQuery } from '../utils';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';
import { IQueryParams } from '../types/insertNotificationForOwner.queries';
import { encodeStructId } from '../../substrate/utils';

const query = `
  INSERT INTO df.notifications
    VALUES(:account, :blockNumber, :eventIndex)
  RETURNING *`

export async function insertNotificationForOwner({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const encodedBlockNumber = encodeStructId(blockNumber.toString())
  const params = { account, blockNumber: encodedBlockNumber, eventIndex }

  try {
    await runQuery<IQueryParams>(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, insertNotificationForOwner)
  }
}