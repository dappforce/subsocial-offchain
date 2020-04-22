import { deleteNotificationsAboutAccount } from '../../postgres/delete-activity';
import { deleteAccountFollower } from '../../postgres/delete-follower';
import { SubstrateEvent } from '../types';

export const onAccountUnfollowed = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1].toString();
  await deleteNotificationsAboutAccount(follower, following);
  await deleteAccountFollower(data);
}
