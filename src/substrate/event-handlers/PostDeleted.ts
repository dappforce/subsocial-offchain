import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsAboutPost } from '../../postgres/delete-activity';
import { deletePostFollower } from '../../postgres/delete-follower';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK, HandlerResultErrorInPostgres } from '../types';

export const onPostDeleted: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as PostId;
  await deleteNotificationsAboutPost(follower, following);
  await deletePostFollower(data);
}
