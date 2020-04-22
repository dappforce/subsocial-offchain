import { BlogId } from '@subsocial/types/substrate/interfaces/subsocial';
import { deleteNotificationsAboutBlog } from '../../postgres/delete-activity';
import { deleteBlogFollower } from '../../postgres/delete-follower';
import { SubstrateEvent } from '../types';

export const onBlogUnfollowed = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const follower = data[0].toString();
  const following = data[1] as BlogId;
  await deleteNotificationsAboutBlog(follower, following)
  await deleteBlogFollower(data);
}
