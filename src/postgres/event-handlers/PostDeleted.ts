import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsAboutPost } from '../delete-activity';
import { deletePostFollower } from '../delete-follower';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK } from '../../substrate/types';

export const onPostDeleted: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as PostId;
  await deleteNotificationsAboutPost(follower, following);
  await deletePostFollower(data);
  return HandlerResultOK;
}
