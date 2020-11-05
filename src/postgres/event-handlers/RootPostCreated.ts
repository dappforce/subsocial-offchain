import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertPostFollower } from '../insert-follower';
import { insertActivityForPost } from '../insert-activity';
import { fillNewsFeedWithAccountFollowers, fillNewsFeedWithSpaceFollowers } from '../fill-activity';
import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';

export const onRootCreated = async (eventAction: SubstrateEvent, post: Post) => {
  const { author, postId } = parsePostEvent(eventAction)

  await insertPostFollower(eventAction.data);

  const spaceId = post.space_id.unwrap()
  const ids = [spaceId, postId ];
  const insertResult = await insertActivityForPost(eventAction, ids, 0);
  if (insertResult === undefined) return;

  await fillNewsFeedWithSpaceFollowers(spaceId, { account: author, ...insertResult });
  await fillNewsFeedWithAccountFollowers({ account: author, ...insertResult });
}
