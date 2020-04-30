import { CommentId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/server';
import { insertActivityForComment } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNotificationsWithCommentFollowers } from '../fill-activity';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onCommentShared: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const commentId = data[1] as CommentId;
  const comment = await substrate.findComment(commentId);
  if (!comment) return;

  const postId = comment.post_id;
  const post = await substrate.findPost(postId);
  if (!post) return;

  const ids = [ post.blog_id, postId, commentId ];
  const account = comment.created.account.toString();
  const activityId = await insertActivityForComment(eventAction, ids, account);
  if (activityId === -1) return;

  await fillNotificationsWithCommentFollowers(commentId, account, activityId);
  await fillNotificationsWithAccountFollowers(account, activityId);
}
