import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertBlogFollower } from '../insert-follower';
import { insertActivityForBlog } from '../insert-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onBlogFollowed: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  await insertBlogFollower(data);
  const blogId = data[1] as BlogId;
  const blog = await substrate.findBlog(blogId);
  if (!blog) return;

  const count = blog.followers_count.toNumber() - 1;
  const account = blog.owner.toString();
  const id = await insertActivityForBlog(eventAction, count, account);
  if (id === -1) return;

  const follower = data[0].toString();
  if (follower === account) return;

  await insertNotificationForOwner(id, account);
}
