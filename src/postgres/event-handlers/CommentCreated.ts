import { CommentId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/server';
import { insertCommentFollower } from '../insert-follower';
import { insertActivityComments, insertActivityForComment } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNotificationsWithPostFollowers } from '../fill-activity';
import { substrateLog as log } from '../../connections/loggers';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK } from '../../substrate/types';

export const onCommentCreated: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  await insertCommentFollower(data);
  const commentId = data[1] as CommentId;

  const comment = await substrate.findComment(commentId);
  if (!comment) return HandlerResultOK;

  const postId = comment.post_id;
  const post = await substrate.findPost(postId);
  if (!post) return HandlerResultOK;

  const postCreator = post.created.account.toString();
  const commentCreator = comment.created.account.toString();
  const ids = [ postId, commentId ];
  if (comment.parent_id.isSome) {
    log.debug('Comment has a parent id');
    insertActivityComments(eventAction, ids, comment);
  } else {
    const activityId = await insertActivityForComment(eventAction, ids, postCreator);
    if (activityId === -1) return HandlerResultOK;

    log.debug('Comment does not have a parent id');
    await fillNotificationsWithPostFollowers(postId, commentCreator, activityId);
    await fillNotificationsWithAccountFollowers(commentCreator, activityId);
  }
  return HandlerResultOK;
}
