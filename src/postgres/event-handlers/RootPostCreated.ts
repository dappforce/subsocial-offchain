import { NormalizedPost } from '../../substrate/normalizers';
import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { fillNewsFeedWithAccountFollowers } from '../fills/fillNewsFeedWithAccountFollowers';
import { fillNewsFeedWithSpaceFollowers } from '../fills/fillNewsFeedWithSpaceFollowers';
import { insertActivityForPost } from '../inserts/insertActivityForPost';
import { insertPostFollower } from '../inserts/insertPostFollower';

export const onRootCreated = async (eventAction: SubstrateEvent, post: NormalizedPost) => {
  const { author, postId } = parsePostEvent(eventAction)

  await insertPostFollower(eventAction.data);

  const spaceId = post.spaceId
  const ids = [spaceId, postId];
  const insertResult = await insertActivityForPost(eventAction, ids, 0);
  if (insertResult === undefined) return;

  await fillNewsFeedWithSpaceFollowers(spaceId, { account: author, ...insertResult });
  await fillNewsFeedWithAccountFollowers({ account: author, ...insertResult });
}
