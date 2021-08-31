import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { fillNotificationsWithAccountFollowers } from '../fills/fillNotificationsWithAccountFollowers';
import { insertActivityForPost } from '../inserts/insertActivityForPost';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';
import { NormalizedPost } from '../../substrate/normalizers';
import { informTelegramClientAboutNotifOrFeed } from '../../express-api/events';

export const onRootPostShared = async (eventAction: SubstrateEvent, post: NormalizedPost) => {
  const { author, postId } = parsePostEvent(eventAction)

  let spaceId = post.spaceId

  const ids = [ spaceId, postId ];
  const insertResult = await insertActivityForPost(eventAction, ids);
  if (insertResult === undefined) return;

  const account = post.createdByAccount;
  await insertNotificationForOwner({ account, ...insertResult });
  await fillNotificationsWithAccountFollowers({ account: author, ...insertResult });

  informTelegramClientAboutNotifOrFeed(eventAction.data[0].toString(), account, insertResult.blockNumber, insertResult.eventIndex, 'notification')
  informTelegramClientAboutNotifOrFeed(eventAction.data[0].toString(), account, insertResult.blockNumber, insertResult.eventIndex, 'feed')

}
