import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../connections/subsocial';
import { insertSpaceFollower } from '../insert-follower';
import { insertActivityForSpace } from '../insert-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onSpaceFollowed: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  await insertSpaceFollower(data);
  const spaceId = data[1] as SpaceId;
  const space = await substrate.findSpace({ id: spaceId });
  if (!space) return;

  const count = space.followers_count.toNumber() - 1;
  const account = space.owner.toString();
  const id = await insertActivityForSpace(eventAction, count, account);
  if (id === -1) return;

  const follower = data[0].toString();
  if (follower === account) return;

  await insertNotificationForOwner(id, account);
}
