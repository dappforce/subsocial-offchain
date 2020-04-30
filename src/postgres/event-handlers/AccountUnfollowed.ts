import { deleteNotificationsAboutAccount } from '../delete-activity';
import { deleteAccountFollower } from '../delete-follower';
import { SubstrateEvent, EventHandlerFn, HandlerResultOK } from '../../substrate/types';

export const onAccountUnfollowed: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1].toString();
  await deleteNotificationsAboutAccount(follower, following);
  await deleteAccountFollower(data);
  return HandlerResultOK;
}
