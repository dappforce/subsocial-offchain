import { PostId, Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertPostFollower } from '../insert-follower';
import { insertActivityForPost } from '../insert-activity';
import { fillNewsFeedWithAccountFollowers, fillNewsFeedWithBlogFollowers } from '../fill-activity';
import { SubstrateEvent } from '../../substrate/types';


export const onRootCreated = async (eventAction: SubstrateEvent, post: Post) => {
  const { data } = eventAction;
  await insertPostFollower(data);
  const postId = data[1] as PostId;
  const follower = data[0].toString();

  const blogId = post.blog_id.unwrap()
  const ids = [blogId, postId ];
  const activityId = await insertActivityForPost(eventAction, ids, 0);
  if (activityId === -1) return;

  await fillNewsFeedWithBlogFollowers(blogId, follower, activityId);
  await fillNewsFeedWithAccountFollowers(follower, activityId);
}
