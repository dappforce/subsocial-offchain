import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsAboutBlog } from '../delete-activity';
import { deleteBlogFollower } from '../delete-follower';
import { SubstrateEvent, EventHandlerFn, HandlerResult, HandlerResultOK } from '../../substrate/types';

export const onBlogUnfollowed: EventHandlerFn = async (eventAction: SubstrateEvent): Promise<HandlerResult> => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as BlogId;
  await deleteNotificationsAboutBlog(follower, following)
  await deleteBlogFollower(data);
  return HandlerResultOK;
}
