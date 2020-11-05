import { EventHandlerFn } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { parseCommentEvent } from '../../substrate/utils';
import { deleteCommentFollower } from '../deletes/deleteCommentFollower';
import { deleteNotificationsAboutComment } from '../deletes/deleteNotificationsAboutComment';

export const onCommentDeleted: EventHandlerFn = async (eventAction) => {
  const { author, commentId } = parseCommentEvent(eventAction)
  eventAction.eventName = VirtualEvents.CommentDeleted
  await deleteNotificationsAboutComment(author, commentId)
  await deleteCommentFollower(eventAction.data)
}
