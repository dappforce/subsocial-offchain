import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { fillNewsFeedWithAccountFollowers } from '../fills/fillNewsFeedWithAccountFollowers';
import { fillNewsFeedWithSpaceFollowers } from '../fills/fillNewsFeedWithSpaceFollowers';
import { fillNotificationsWithAccountFollowers } from '../fills/fillNotificationsWithAccountFollowers';
import { insertActivityForPost } from '../inserts/insertActivityForPost';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';

export const onRootPostShared = async (eventAction: SubstrateEvent, post: Post) => {
  const { author, postId } = parsePostEvent(eventAction)

  let spaceId = post.space_id.unwrapOr(undefined)

  const ids = [ spaceId, postId ];
  const insertResult = await insertActivityForPost(eventAction, ids);
  if (insertResult === undefined) return;

  const account = post.created.account.toString();
  await insertNotificationForOwner({ account, ...insertResult });
  await fillNotificationsWithAccountFollowers({ account: author, ...insertResult });
  await fillNewsFeedWithSpaceFollowers(spaceId, { account: author, ...insertResult });
  await fillNewsFeedWithAccountFollowers({ account: author, ...insertResult })
}
