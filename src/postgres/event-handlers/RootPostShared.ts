import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertActivityForPost } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNewsFeedWithAccountFollowers, fillNewsFeedWithBlogFollowers } from '../fill-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';

export const onRootPostShared = async (eventAction: SubstrateEvent, post: Post) => {
  const { author, postId } = parsePostEvent(eventAction)

  let blogId = post.blog_id.unwrapOr(undefined)

  const ids = [ blogId, postId ];
  const activityId = await insertActivityForPost(eventAction, ids);
  if (activityId === -1) return;

  const account = post.created.account.toString();
  await insertNotificationForOwner(activityId, account);
  await fillNotificationsWithAccountFollowers(author, activityId);
  await fillNewsFeedWithBlogFollowers(blogId, author, activityId);
  await fillNewsFeedWithAccountFollowers(author, activityId)
}
