import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsAboutPost } from '../delete-activity';
import { deletePostFollower } from '../delete-follower';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onRegularOrSharedPostDeleted: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as PostId;
  await deleteNotificationsAboutPost(follower, following);
  await deletePostFollower(data);
}
