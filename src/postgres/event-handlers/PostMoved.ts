import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertPostFollower } from '../insert-follower';
import { insertActivityForPost } from '../insert-activity';
import { fillNewsFeedWithAccountFollowers, fillNewsFeedWithSpaceFollowers } from '../fill-activity';
import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { movePost } from '../move-post';
import { substrate } from '../../substrate/subscribe';


export const onPostMoved = async (eventAction: SubstrateEvent) => {
  const { author, postId } = parsePostEvent(eventAction)

  const post = await substrate.findPost({ id: postId })
  if (!post) return;

  await insertPostFollower(eventAction.data);

  const spaceId = post.space_id.unwrap()
  const ids = [spaceId, postId ];
  const activityId = await insertActivityForPost(eventAction, ids, 0);
  if (activityId === -1) return;

  await fillNewsFeedWithSpaceFollowers(spaceId, author, activityId);
  await fillNewsFeedWithAccountFollowers(author, activityId);

  await movePost(post);
}
