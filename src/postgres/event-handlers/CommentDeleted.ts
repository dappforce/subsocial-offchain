import { deleteNotificationsAboutComment } from '../delete-activity';
import { deleteCommentFollower } from '../delete-follower';
import { EventHandlerFn } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { parseCommentEvent } from '../../substrate/utils';

export const onCommentDeleted: EventHandlerFn = async (eventAction) => {
  const { author, commentId } = parseCommentEvent(eventAction)
  eventAction.eventName = VirtualEvents.CommentDeleted
  await deleteNotificationsAboutComment(author, commentId)
  await deleteCommentFollower(eventAction.data)
}
