import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { findSpace } from '../../substrate/api-wrappers';
import { EventHandlerFn } from '../../substrate/types';
import { insertActivityForSpace } from '../inserts/insertActivityForSpace';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';
import { insertSpaceFollower } from '../inserts/insertSpaceFollower';
import { informTelegramClientAboutNotifOrFeed } from '../../ws/events';

export const onSpaceFollowed: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  await insertSpaceFollower(data);
  const spaceId = data[1] as SpaceId;
  const space = await findSpace(spaceId);
  if (!space) return;

  const count = space.followersCount - 1;
  const account = space.owner;
  const insertResult = await insertActivityForSpace(eventAction, count, account);
  if (insertResult === undefined) return;

  const follower = data[0].toString();
  if (follower === account) return;

  await insertNotificationForOwner({ account, ...insertResult });
  informTelegramClientAboutNotifOrFeed(eventAction.data[0].toString(), account, insertResult.blockNumber, insertResult.eventIndex, 'notification')
}
