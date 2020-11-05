import { pg } from '../../connections';
import { newPgError } from '../utils';
import { updateCountOfUnreadNotifications } from '../notifications';
import { ActivitiesParamsWithAccount } from '../queries/types';

export const insertNotificationForOwner = async ({ account, blockNumber, eventIndex }: ActivitiesParamsWithAccount) => {
  const params = [account, blockNumber, eventIndex]
  const query = `
    INSERT INTO df.notifications
      VALUES($1, $2, $3) 
    RETURNING *`

  try {
    await pg.query(query, params)
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    throw newPgError(err, insertNotificationForOwner)
  }
}