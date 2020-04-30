import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertActivityForPost } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNewsFeedWithAccountFollowers, fillNewsFeedWithBlogFollowers } from '../fill-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onPostShared: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const postId = data[1] as PostId;
  const follower = data[0].toString();

  const post = await substrate.findPost(postId);
  if (!post) return;

  const ids = [ post.blog_id, postId ];
  const activityId = await insertActivityForPost(eventAction, ids);
  if (activityId === -1) return;

  const account = post.created.account.toString();
  await insertNotificationForOwner(activityId, account);
  await fillNotificationsWithAccountFollowers(follower, activityId);
  await fillNewsFeedWithBlogFollowers(post.blog_id, follower, activityId);
  await fillNewsFeedWithAccountFollowers(follower, activityId)
}
