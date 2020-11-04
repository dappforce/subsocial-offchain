import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertActivityForComment } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNotificationsWithCommentFollowers, fillNewsFeedWithSpaceFollowers, fillNewsFeedWithAccountFollowers } from '../fill-activity';
import { SubstrateEvent } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { parseCommentEvent } from '../../substrate/utils';

export const onCommentShared = async (eventAction: SubstrateEvent, comment: Post) => {
  const { author, commentId } = parseCommentEvent(eventAction)

  const rootPostId = comment.extension.asComment.root_post_id;
  const rootPost = await substrate.findPost({ id: rootPostId });
  if (!rootPost) return;

  eventAction.eventName = VirtualEvents.CommentShared
  const spaceId = rootPost.space_id.unwrapOr(null);
  const ids = [ spaceId, rootPostId, commentId ];
  const account = comment.created.account.toString();

  const insertResult = await insertActivityForComment(eventAction, ids, account);
  if (insertResult === undefined) return;

  const {blockNumber, eventIndex} = insertResult

  await fillNotificationsWithCommentFollowers(commentId, account, eventIndex, blockNumber);
  await fillNotificationsWithAccountFollowers(account, eventIndex, blockNumber);
  await fillNewsFeedWithSpaceFollowers(spaceId, author, eventIndex, blockNumber);
  await fillNewsFeedWithAccountFollowers(author, eventIndex, blockNumber)
}
