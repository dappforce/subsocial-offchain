import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/server';
import { insertActivityForBlog } from '../insert-activity';
import { fillNotificationsWithAccountFollowers } from '../fill-activity';
import { SubstrateEvent, EventHandlerFn, HandlerResultOK } from '../../substrate/types';

export const onBlogCreated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const account = data[0].toString();
  const activityId = await insertActivityForBlog(eventAction, 0);
  await fillNotificationsWithAccountFollowers(account, activityId);

  const blogId = data[1] as BlogId;
  const blog = await substrate.findBlog(blogId);
  if (!blog) return HandlerResultOK;

  return HandlerResultOK;
}
