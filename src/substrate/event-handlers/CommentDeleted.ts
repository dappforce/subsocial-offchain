import { CommentId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsAboutComment } from '../../postgres/delete-activity';
import { deleteCommentFollower } from '../../postgres/delete-follower';
import { SubstrateEvent } from '../types';

export const onCommentDeleted = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as CommentId;
  await deleteNotificationsAboutComment(follower, following);
  await deleteCommentFollower(data);
}
