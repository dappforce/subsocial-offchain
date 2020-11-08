import { EventHandlerFn } from '../../substrate/types';
import { deleteAccountFollower } from '../deletes/deleteAccountFollower';
import { deleteNotificationsAboutAccount } from '../deletes/deleteNotificationsAboutAccount';

export const onAccountUnfollowed: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1].toString();
  await deleteNotificationsAboutAccount(follower, following);
  await deleteAccountFollower(data);
}
