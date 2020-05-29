import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsAboutSpace } from '../delete-activity';
import { deleteSpaceFollower } from '../delete-follower';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onSpaceUnfollowed: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as SpaceId;
  await deleteNotificationsAboutSpace(follower, following)
  await deleteSpaceFollower(data);
}
