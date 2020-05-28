import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertActivityForComment } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNotificationsWithCommentFollowers, fillNewsFeedWithBlogFollowers, fillNewsFeedWithAccountFollowers } from '../fill-activity';
import { SubstrateEvent } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { parseCommentEvent } from '../../substrate/utils';

export const onCommentShared = async (eventAction: SubstrateEvent, comment: Post) => {
  const { author, commentId } = parseCommentEvent(eventAction)

  const rootPostId = comment.extension.asComment.root_post_id;
  const rootPost = await substrate.findPost(rootPostId);
  if (!rootPost) return;

  eventAction.eventName = VirtualEvents.CommentShared
  const blogId = rootPost.blog_id.unwrapOr(null);
  const ids = [ blogId, rootPostId, commentId ];
  const account = comment.created.account.toString();

  const activityId = await insertActivityForComment(eventAction, ids, account);
  if (activityId === -1) return;

  await fillNotificationsWithCommentFollowers(commentId, account, activityId);
  await fillNotificationsWithAccountFollowers(account, activityId);
  await fillNewsFeedWithBlogFollowers(blogId, author, activityId);
  await fillNewsFeedWithAccountFollowers(author, activityId)
}
