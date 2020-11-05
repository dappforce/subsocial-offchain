import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { substrate } from '../../connections/subsocial';
import { insertAccountFollower } from '../inserts/insertAccountFollower';
import { insertActivityForAccount } from '../inserts/insertActivityForAccount';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';

export const onAccountFollowed: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  await insertAccountFollower(data);
  const account = data[1].toString()
  const socialAccount = await substrate.findSocialAccount(account)
  if (!socialAccount) return;

  const count = socialAccount.followers_count.toNumber() - 1;
  const insertResult = await insertActivityForAccount(eventAction, count);
  if (insertResult === undefined) return

  const following = data[1].toString();
  await insertNotificationForOwner( { ...insertResult, account: following });
}
