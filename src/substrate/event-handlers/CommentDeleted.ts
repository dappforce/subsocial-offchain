import { CommentId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsAboutComment } from '../../postgres/delete-activity';
import { deleteCommentFollower } from '../../postgres/delete-follower';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK, HandlerResultErrorInPostgres } from '../types';

export const onCommentDeleted: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as CommentId;
  await deleteNotificationsAboutComment(follower, following);
  await deleteCommentFollower(data);
}
