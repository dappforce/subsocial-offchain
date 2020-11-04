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
  if (insertResult === undefined) return;

  const {blockNumber, eventIndex} = insertResult

  const account = post.created.account.toString();
  await insertNotificationForOwner(eventIndex, blockNumber, account);
  await fillNotificationsWithAccountFollowers(author, eventIndex, blockNumber);
  await fillNewsFeedWithSpaceFollowers(spaceId, author, eventIndex, blockNumber);
  await fillNewsFeedWithAccountFollowers(author, eventIndex, blockNumber)
}
