import { PostId, Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertActivityForCommentReaction } from '../insert-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent } from '../../substrate/types';

export const onCommentReactionCreated = async (eventAction: SubstrateEvent, post: Post) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const commentId = data[1] as PostId;

  const { 
    extension: { asComment: { parent_id, root_post_id } },
    created: { account },
    upvotes_count,
    downvotes_count
  } = post;

  const creator = account.toString()

  const parentId = parent_id.unwrapOr(root_post_id)
  const ids = [ parentId, commentId ];
  const count = (upvotes_count.toNumber() + downvotes_count.toNumber()) - 1;
  const activityId = await insertActivityForCommentReaction(eventAction, count, ids, creator);
  if (activityId === -1) return;

  if (follower === creator) return;

  // insertAggStream(eventAction, commentId);
  await insertNotificationForOwner(activityId, creator);
}
