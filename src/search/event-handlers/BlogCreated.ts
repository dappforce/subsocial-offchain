import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_BLOGS } from '../../search/config';
import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/server';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK } from '../../substrate/types';

export const onBlogCreated: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;

  const blogId = data[1] as BlogId;
  const blog = await substrate.findBlog(blogId);
  if (!blog) return HandlerResultOK;

  indexContentFromIpfs(ES_INDEX_BLOGS, blog.ipfs_hash.toString(), blogId);
  return HandlerResultOK;
}
