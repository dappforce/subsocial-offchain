import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_BLOGS } from '../../search/config';
import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../server';
import { insertActivityForBlog } from '../../postgres/insert-activity';
import { fillNotificationsWithAccountFollowers } from '../../postgres/fill-activity';
import { SubstrateEvent } from '../types';

export const onBlogCreated = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const account = data[0].toString();
  const activityId = await insertActivityForBlog(eventAction, 0);
  await fillNotificationsWithAccountFollowers(account, activityId);

  const blogId = data[1] as BlogId;
  const blog = await substrate.findBlog(blogId);
  if (!blog) return;

  indexContentFromIpfs(ES_INDEX_BLOGS, blog.ipfs_hash.toString(), blogId);
}
