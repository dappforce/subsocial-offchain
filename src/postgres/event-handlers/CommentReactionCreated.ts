import { NormalizedPost, asNormalizedComment } from '../../substrate/normalizers';
import { SubstrateEvent } from '../../substrate/types';
import { parseCommentEvent } from '../../substrate/utils';
import { VirtualEvents } from '../../substrate/utils';
import { insertActivityForCommentReaction } from '../inserts/insertActivityForCommentReaction';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';
import { informTelegramClientAboutNotifOrFeed } from '../../ws/events';

export const onCommentReactionCreated = async (eventAction: SubstrateEvent, post: NormalizedPost) => {
  const { author: voter, commentId } = parseCommentEvent(eventAction)

  const {
    parentId,
    rootPostId,
    createdBy,
    upvotesCount,
    downvotesCount
  } = asNormalizedComment(post)

  eventAction.eventName = VirtualEvents.CommentReactionCreated
  const parent = parentId ? parentId : rootPostId
  const ids = [ parent, commentId ];
  const reactionCount = upvotesCount + downvotesCount - 1;

  const insertResult = await insertActivityForCommentReaction(eventAction, reactionCount, ids, createdBy);
  if (insertResult === undefined) return;

  if (voter === createdBy) return;
  // insertAggStream(eventAction, commentId);

  await insertNotificationForOwner({ ...insertResult, account: createdBy });
  informTelegramClientAboutNotifOrFeed(eventAction.data[0].toString(), createdBy, insertResult.blockNumber, insertResult.eventIndex, 'notification')
}
