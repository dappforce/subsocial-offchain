import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsAboutComment } from '../delete-activity';
import { deleteCommentFollower } from '../delete-follower';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onCommentDeleted: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as PostId;
  await deleteNotificationsAboutComment(follower, following);
  await deleteCommentFollower(data);
}
