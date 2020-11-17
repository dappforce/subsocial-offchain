import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { fillNewsFeedWithAccountFollowers } from '../fills/fillNewsFeedWithAccountFollowers';
import { fillNewsFeedWithSpaceFollowers } from '../fills/fillNewsFeedWithSpaceFollowers';
import { fillNotificationsWithAccountFollowers } from '../fills/fillNotificationsWithAccountFollowers';
import { insertActivityForPost } from '../inserts/insertActivityForPost';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';
import { NormalizedPost } from '../../substrate/normalizers';
import { isEmptyStr } from '@subsocial/utils';

export const onRootPostShared = async (eventAction: SubstrateEvent, post: NormalizedPost) => {
  const { author, postId } = parsePostEvent(eventAction)

  let spaceId = !isEmptyStr(post.spaceId) ? post.spaceId : undefined

  const ids = [ spaceId, postId ];
  const insertResult = await insertActivityForPost(eventAction, ids);
  if (insertResult === undefined) return;

  const account = post.createdByAccount;
  await insertNotificationForOwner({ account, ...insertResult });
  await fillNotificationsWithAccountFollowers({ account: author, ...insertResult });
  await fillNewsFeedWithSpaceFollowers(spaceId, { account: author, ...insertResult });
  await fillNewsFeedWithAccountFollowers({ account: author, ...insertResult })
}
