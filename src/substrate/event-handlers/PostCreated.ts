import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_POSTS } from '../../search/config';
import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../server';
import { insertPostFollower } from '../../postgres/insert-follower';
import { insertActivityForPost } from '../../postgres/insert-activity';
import { fillNewsFeedWithAccountFollowers, fillNewsFeedWithBlogFollowers } from '../../postgres/fill-activity';
import { SubstrateEvent } from '../types';

export const onPostCreated = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  insertPostFollower(data);
  const postId = data[1] as PostId;
  const follower = data[0].toString();

  const post = await substrate.findPost(postId);
  if (!post) return;

  const ids = [ post.blog_id, postId ];
  const activityId = await insertActivityForPost(eventAction, ids, 0);
  if (activityId === -1) return;

  await fillNewsFeedWithBlogFollowers(post.blog_id, follower, activityId);
  await fillNewsFeedWithAccountFollowers(follower, activityId);
  indexContentFromIpfs(ES_INDEX_POSTS, post.ipfs_hash.toString(), postId);
}
