import { EventHandlerFn } from '../../substrate/types';
import { insertAccountFollower } from '../inserts/insertAccountFollower';
import { insertActivityForAccount } from '../inserts/insertActivityForAccount';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';
import { findSocialAccount } from '../../substrate/api-wrappers';
import { informTelegramClientAboutNotifOrFeed } from '../../express-api/events';

export const onAccountFollowed: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  await insertAccountFollower(data);
  const account = data[1].toString()
  const socialAccount = await findSocialAccount(account)
  if (!socialAccount) return;

  const count = socialAccount.followersCount - 1;
  const insertResult = await insertActivityForAccount(eventAction, count);
  if (insertResult === undefined) return

  const following = data[1].toString();
  await insertNotificationForOwner( { ...insertResult, account: following });
  informTelegramClientAboutNotifOrFeed(data[0].toString(), account, insertResult.blockNumber, insertResult.eventIndex, 'notification')
}
