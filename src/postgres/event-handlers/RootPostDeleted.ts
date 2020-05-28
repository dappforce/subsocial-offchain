import { deleteNotificationsAboutPost } from '../delete-activity';
import { deletePostFollower } from '../delete-follower';
import { EventHandlerFn } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';

export const onRootPostDeleted: EventHandlerFn = async (eventAction) => {
  const { author, postId } = parsePostEvent(eventAction)

  await deleteNotificationsAboutPost(author, postId);
  await deletePostFollower(eventAction.data);
}
