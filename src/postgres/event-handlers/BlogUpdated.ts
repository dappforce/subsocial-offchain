import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/server';
import { SubstrateEvent, EventHandlerFn, HandlerResultOK } from '../../substrate/types';

export const onBlogUpdated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const blogId = data[1] as BlogId;
  const blog = await substrate.findBlog(blogId);
  if (!blog) return HandlerResultOK;

  return HandlerResultOK;
}
