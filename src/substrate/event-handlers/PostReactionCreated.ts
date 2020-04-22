import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../server';
import { insertActivityForPostReaction } from '../../postgres/insert-activity';
import { insertNotificationForOwner } from '../../postgres/notifications';
import { SubstrateEvent } from '../types';

export const onPostReactionCreated = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const postId = data[1] as PostId;
  const post = await substrate.findPost(postId);
  if (!post) return;

  const ids = [ postId ];
  const count = post.upvotes_count.toNumber() + post.downvotes_count.toNumber() - 1;
  const account = post.created.account.toString();
  const activityId = await insertActivityForPostReaction(eventAction, count, ids, account);
  if (activityId === -1) return;

  if (follower === account) return;

  insertNotificationForOwner(activityId, account);
}
