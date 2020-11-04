import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertActivityForCommentReaction } from '../insert-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent } from '../../substrate/types';
import { parseCommentEvent } from '../../substrate/utils';
import { VirtualEvents } from '../../substrate/utils';

export const onCommentReactionCreated = async (eventAction: SubstrateEvent, post: Post) => {
  const { author: voter, commentId } = parseCommentEvent(eventAction)

  const { 
    extension: { asComment: { parent_id, root_post_id } },
    created: { account },
    upvotes_count,
    downvotes_count
  } = post;
  
  eventAction.eventName = VirtualEvents.CommentReactionCreated
  const commentAuthor = account.toString()
  const parentId = parent_id.unwrapOr(root_post_id)
  const ids = [ parentId, commentId ];
  const reactionCount = upvotes_count.add(downvotes_count).toNumber() - 1;

  const insertResult = await insertActivityForCommentReaction(eventAction, reactionCount, ids, commentAuthor);
  if (insertResult === undefined) return;

  if (voter === commentAuthor) return;

  // insertAggStream(eventAction, commentId);
  await insertNotificationForOwner({ ...insertResult, account: commentAuthor });
}
