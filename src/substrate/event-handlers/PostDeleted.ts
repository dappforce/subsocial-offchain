import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsAboutPost } from '../../postgres/delete-activity';
import { deletePostFollower } from '../../postgres/delete-follower';
import { SubstrateEvent } from '../types';

export const onPostDeleted = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as PostId;
  await deleteNotificationsAboutPost(follower, following);
  await deletePostFollower(data);
}
