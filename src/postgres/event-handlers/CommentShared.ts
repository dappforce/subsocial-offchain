import { PostId, Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertActivityForComment } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNotificationsWithCommentFollowers, fillNewsFeedWithBlogFollowers, fillNewsFeedWithAccountFollowers } from '../fill-activity';
import { SubstrateEvent } from '../../substrate/types';

export const onCommentShared = async (eventAction: SubstrateEvent, comment: Post) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const commentId = data[1] as PostId;

  const postId = comment.extension.asComment.root_post_id;
  const post = await substrate.findPost(postId);
  if (!post) return;

  const blogId =  post.blog_id.unwrapOr(null);

  const ids = [ blogId, postId, commentId ];
  const account = comment.created.account.toString();
  const activityId = await insertActivityForComment(eventAction, ids, account);
  if (activityId === -1) return;

  await fillNotificationsWithCommentFollowers(commentId, account, activityId);
  await fillNotificationsWithAccountFollowers(account, activityId);
  await fillNewsFeedWithBlogFollowers(blogId, follower, activityId);
  await fillNewsFeedWithAccountFollowers(follower, activityId)
}
