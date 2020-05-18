import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertActivityForPost } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNewsFeedWithAccountFollowers, fillNewsFeedWithBlogFollowers } from '../fill-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';

export const onPostShared: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const postId = data[1] as PostId;
  const follower = data[0].toString();

  const post = await substrate.findPost(postId);
  if (!post) return;

  if (post.extension.isComment) {
    eventAction.eventName = VirtualEvents.CommentShared
  }

  const blogId = post.blog_id.unwrap()
  const ids = [ blogId, postId ];
  const activityId = await insertActivityForPost(eventAction, ids);
  if (activityId === -1) return;

  const account = post.created.account.toString();
  await insertNotificationForOwner(activityId, account);
  await fillNotificationsWithAccountFollowers(follower, activityId);
  await fillNewsFeedWithBlogFollowers(blogId, follower, activityId);
  await fillNewsFeedWithAccountFollowers(follower, activityId)
}
