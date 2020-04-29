import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/server';
import { insertBlogFollower } from '../insert-follower';
import { insertActivityForBlog } from '../insert-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK } from '../../substrate/types';

export const onBlogFollowed: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  await insertBlogFollower(data);
  const blogId = data[1] as BlogId;
  const blog = await substrate.findBlog(blogId);
  if (!blog) return HandlerResultOK;

  const count = blog.followers_count.toNumber() - 1;
  const account = blog.created.account.toString();
  const id = await insertActivityForBlog(eventAction, count, account);
  if (id === -1) return HandlerResultOK;

  const follower = data[0].toString();
  if (follower === account) return HandlerResultOK;

  await insertNotificationForOwner(id, account);
  return HandlerResultOK;
}
