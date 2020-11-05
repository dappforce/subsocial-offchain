import { EventHandlerFn } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { deleteNotificationsAboutPost } from '../deletes/deleteNotificationsAboutPost';
import { deletePostFollower } from '../deletes/deletePostFollower';

export const onRootPostDeleted: EventHandlerFn = async (eventAction) => {
  const { author, postId } = parsePostEvent(eventAction)

  await deleteNotificationsAboutPost(author, postId);
  await deletePostFollower(eventAction.data);
}
