import { deleteNotificationsAboutAccount } from '../delete-activity';
import { deleteAccountFollower } from '../delete-follower';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK } from '../../substrate/types';

export const onAccountUnfollowed: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1].toString();
  await deleteNotificationsAboutAccount(follower, following);
  await deleteAccountFollower(data);
  return HandlerResultOK;
}
