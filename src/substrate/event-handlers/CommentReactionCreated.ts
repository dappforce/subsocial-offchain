import { CommentId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../server';
import { insertActivityForCommentReaction } from '../../postgres/insert-activity';
import { insertNotificationForOwner } from '../../postgres/notifications';
import { SubstrateEvent } from '../types';

export const onCommentReactionCreated = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const commentId = data[1] as CommentId;
  const comment = await substrate.findComment(commentId);
  if (!comment) return;

  const ids = [ comment.post_id, commentId ];
  const account = comment.created.account.toString();
  const count = (comment.upvotes_count.toNumber() + comment.downvotes_count.toNumber()) - 1;
  const activityId = await insertActivityForCommentReaction(eventAction, count, ids, account);
  if (activityId === -1) return;

  if (follower === account) return;

  // insertAggStream(eventAction, commentId);
  insertNotificationForOwner(activityId, account);
}
