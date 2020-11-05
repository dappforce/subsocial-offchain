import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../connections/subsocial';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { insertActivityForSpace } from '../inserts/insertActivityForSpace';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';
import { insertSpaceFollower } from '../inserts/insertSpaceFollower';

export const onSpaceFollowed: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  await insertSpaceFollower(data);
  const spaceId = data[1] as SpaceId;
  const space = await substrate.findSpace({ id: spaceId });
  if (!space) return;

  const count = space.followers_count.toNumber() - 1;
  const account = space.owner.toString();
  const insertResult = await insertActivityForSpace(eventAction, count, account);
  if (insertResult === undefined) return;

  const follower = data[0].toString();
  if (follower === account) return;

  await insertNotificationForOwner({ account, ...insertResult });
}
