import { NormalizedPost } from '../../substrate/normalizers';
import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { insertActivityForPostReaction } from '../inserts/insertActivityForPostReaction';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';
import { informTelegramClientAboutNotifOrFeed } from '../../ws/events';

export const onRootPostReactionCreated = async (eventAction: SubstrateEvent, post: NormalizedPost) => {
  const { author: voter, postId } = parsePostEvent(eventAction)

  const ids = [ postId ];
  const reactionCount = post.upvotesCount + post.downvotesCount - 1;
  const postAuthor = post.ownerId;
  const insertResult = await insertActivityForPostReaction(eventAction, reactionCount, ids, postAuthor);
  if (insertResult === undefined) return

  if (voter === postAuthor) return;

  await insertNotificationForOwner({ ...insertResult, account: postAuthor });
  informTelegramClientAboutNotifOrFeed(eventAction.data[0].toString(), postAuthor, insertResult.blockNumber, insertResult.eventIndex, 'notification')
}