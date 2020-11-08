import { SpaceId } from '@subsocial/types/substrate/interfaces/subsocial';
import { EventHandlerFn } from '../../substrate/types';
import { deleteNotificationsAboutSpace } from '../deletes/deleteNotificationsAboutSpace';
import { deleteSpaceFollower } from '../deletes/deleteSpaceFollower';

export const onSpaceUnfollowed: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as SpaceId;
  await deleteNotificationsAboutSpace(follower, following)
  await deleteSpaceFollower(data);
}
