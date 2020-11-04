import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertActivityForPostReaction } from '../insert-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';

export const onRootPostReactionCreated = async (eventAction: SubstrateEvent, post: Post) => {
  const { author: voter, postId } = parsePostEvent(eventAction)

  const ids = [ postId ];
  const reactionCount = post.upvotes_count.add(post.downvotes_count).toNumber() - 1;
  const postAuthor = post.created.account.toString();
  const insertResult = await insertActivityForPostReaction(eventAction, reactionCount, ids, postAuthor);
  if (insertResult === undefined) return
  
  if (voter === postAuthor) return;

  await insertNotificationForOwner({ ...insertResult, account: postAuthor });
}