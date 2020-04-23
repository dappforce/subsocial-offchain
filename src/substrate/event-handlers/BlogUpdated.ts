import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_BLOGS } from '../../search/config';
import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../server';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK, HandlerResultErrorInPostgres } from '../types';

export const onBlogUpdated: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  const blogId = data[1] as BlogId;
  const blog = await substrate.findBlog(blogId);
  if (!blog) return;

  indexContentFromIpfs(ES_INDEX_BLOGS, blog.ipfs_hash.toString(), blogId);
}
