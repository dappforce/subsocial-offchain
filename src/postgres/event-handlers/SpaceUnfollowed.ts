import { EventHandlerFn } from '../../substrate/types';
import { deleteNewsFeed } from '../deletes/deleteNewsFeed';
import { deleteNotificationsAboutSpace } from '../deletes/deleteNotificationsAboutSpace';
import { deleteSpaceFollower } from '../deletes/deleteSpaceFollower';

export const onSpaceUnfollowed: EventHandlerFn = async (eventAction) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1].toString();
  await deleteNotificationsAboutSpace(follower, following)
  await deleteSpaceFollower(data);
  await deleteNewsFeed(data)
}
