import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../server';
import { insertActivityForPost } from '../../postgres/insert-activity';
import { fillNotificationsWithAccountFollowers, fillNewsFeedWithAccountFollowers, fillNewsFeedWithBlogFollowers } from '../../postgres/fill-activity';
import { insertNotificationForOwner } from '../../postgres/notifications';
import { SubstrateEvent } from '../types';

export const onPostShared = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const postId = data[1] as PostId;
  const follower = data[0].toString();

  const post = await substrate.findPost(postId);
  if (!post) return;

  const ids = [ post.blog_id, postId ];
  const activityId = await insertActivityForPost(eventAction, ids);
  if (activityId === -1) return;

  const account = post.created.account.toString();
  insertNotificationForOwner(activityId, account);
  fillNotificationsWithAccountFollowers(follower, activityId);
  fillNewsFeedWithBlogFollowers(post.blog_id, follower, activityId);
  fillNewsFeedWithAccountFollowers(follower, activityId)
}
