import { pg } from '../../connections';
import { newPgError } from '../utils';
import { ActivitiesParamsWithAccount } from '../queries/types';
import { updateCountOfUnreadNotifications } from '../updates/updateCountOfUnreadNotifications';

const query = `
  INSERT INTO df.notifications
    VALUES($1, $2, $3) 
  RETURNING *`

export async function insertNotificationForOwner({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) {
  const params = [account, blockNumber, eventIndex]

  try {
    await pg.query(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, insertNotificationForOwner)
  }
}