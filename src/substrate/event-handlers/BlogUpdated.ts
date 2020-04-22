import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_BLOGS } from '../../search/config';
import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../server';
import { SubstrateEvent } from '../types';

export const onBlogUpdated = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const blogId = data[1] as BlogId;
  const blog = await substrate.findBlog(blogId);
  if (!blog) return;

  indexContentFromIpfs(ES_INDEX_BLOGS, blog.ipfs_hash.toString(), blogId);
}
