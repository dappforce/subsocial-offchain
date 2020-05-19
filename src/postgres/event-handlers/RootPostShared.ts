import { PostId, Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertActivityForPost } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNewsFeedWithAccountFollowers, fillNewsFeedWithBlogFollowers } from '../fill-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent } from '../../substrate/types';

export const onRootPostShared = async (eventAction: SubstrateEvent, post: Post) => {
  const { data } = eventAction;
  const postId = data[1] as PostId;
  const follower = data[0].toString();

  let blogId = post.blog_id.unwrapOr(undefined)

  const ids = [ blogId, postId ];
  const activityId = await insertActivityForPost(eventAction, ids);
  if (activityId === -1) return;

  const account = post.created.account.toString();
  await insertNotificationForOwner(activityId, account);
  await fillNotificationsWithAccountFollowers(follower, activityId);
  await fillNewsFeedWithBlogFollowers(blogId, follower, activityId);
  await fillNewsFeedWithAccountFollowers(follower, activityId)
}
