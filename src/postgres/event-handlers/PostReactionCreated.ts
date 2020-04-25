import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/server';
import { insertActivityForPostReaction } from '../insert-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK } from '../../substrate/types';

export const onPostReactionCreated: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const postId = data[1] as PostId;
  const post = await substrate.findPost(postId);
  if (!post) return HandlerResultOK;

  const ids = [ postId ];
  const count = post.upvotes_count.toNumber() + post.downvotes_count.toNumber() - 1;
  const account = post.created.account.toString();
  const activityId = await insertActivityForPostReaction(eventAction, count, ids, account);
  if (activityId === -1) return HandlerResultOK;

  if (follower === account) return HandlerResultOK;

  insertNotificationForOwner(activityId, account);
  return HandlerResultOK;
}
