import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertActivityForPost } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNewsFeedWithAccountFollowers, fillNewsFeedWithSpaceFollowers } from '../fill-activity';
import { insertNotificationForOwner } from '../notifications';
import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';

export const onRootPostShared = async (eventAction: SubstrateEvent, post: Post) => {
  const { author, postId } = parsePostEvent(eventAction)

  let spaceId = post.space_id.unwrapOr(undefined)

  const ids = [ spaceId, postId ];
  const insertResult = await insertActivityForPost(eventAction, ids);
  if (insertResult === {}) return;

  const account = post.created.account.toString();
  await insertNotificationForOwner(insertResult.eventIndex, insertResult.activityAccount, insertResult.blockNumber, account);
  await fillNotificationsWithAccountFollowers(author, insertResult.eventIndex, insertResult.activityAccount, insertResult.blockNumber);
  await fillNewsFeedWithSpaceFollowers(spaceId, author, insertResult.eventIndex, insertResult.activityAccount, insertResult.blockNumber);
  await fillNewsFeedWithAccountFollowers(author, insertResult.eventIndex, insertResult.activityAccount, insertResult.blockNumber)
}
