import { insertAccountFollower } from '../../postgres/insert-follower';
import { insertActivityForAccount } from '../../postgres/insert-activity';
import { insertNotificationForOwner } from '../../postgres/notifications';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { substrate } from '../../connections/connect-subsocial';

export const onAccountFollowed: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  await insertAccountFollower(data);
  const account = data[1].toString()
  const socialAccount = await substrate.findSocialAccount(account)
  if (!socialAccount) return;

  const count = socialAccount.followers_count.toNumber() - 1;
  const id = await insertActivityForAccount(eventAction, count);
  if (id === -1) return;

  const following = data[1].toString();
  await insertNotificationForOwner(id, following);
}
