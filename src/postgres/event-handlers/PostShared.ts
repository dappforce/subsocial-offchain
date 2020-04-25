import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/server';
import { insertActivityForPost } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNewsFeedWithAccountFollowers, fillNewsFeedWithBlogFollowers } from '../fill-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK } from '../../substrate/types';

export const onPostShared: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  const postId = data[1] as PostId;
  const follower = data[0].toString();

  const post = await substrate.findPost(postId);
  if (!post) return HandlerResultOK;

  const ids = [ post.blog_id, postId ];
  const activityId = await insertActivityForPost(eventAction, ids);
  if (activityId === -1) return HandlerResultOK;

  const account = post.created.account.toString();
  insertNotificationForOwner(activityId, account);
  fillNotificationsWithAccountFollowers(follower, activityId);
  fillNewsFeedWithBlogFollowers(post.blog_id, follower, activityId);
  fillNewsFeedWithAccountFollowers(follower, activityId)
  return HandlerResultOK;
}
