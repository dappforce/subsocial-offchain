import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../server';
import { insertBlogFollower } from '../../postgres/insert-follower';
import { insertActivityForBlog } from '../../postgres/insert-activity';
import { insertNotificationForOwner } from '../../postgres/notifications';
import { SubstrateEvent } from '../types';

export const onBlogFollowed = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  await insertBlogFollower(data);
  const blogId = data[1] as BlogId;
  const blog = await substrate.findBlog(blogId);
  if (!blog) return;

  const count = blog.followers_count.toNumber() - 1;
  const account = blog.created.account.toString();
  const id = await insertActivityForBlog(eventAction, count, account);
  if (id === -1) return;

  const follower = data[0].toString();
  if (follower === account) return;

  insertNotificationForOwner(id, account);
}
