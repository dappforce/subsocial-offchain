import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../connections/subsocial';
import { SubstrateEvent } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { parseCommentEvent } from '../../substrate/utils';
import { fillNewsFeedWithAccountFollowers } from '../fills/fillNewsFeedWithAccountFollowers';
import { fillNewsFeedWithSpaceFollowers } from '../fills/fillNewsFeedWithSpaceFollowers';
import { fillNotificationsWithAccountFollowers } from '../fills/fillNotificationsWithAccountFollowers';
import { fillNotificationsWithCommentFollowers } from '../fills/fillNotificationsWithCommentFollowers';
import { insertActivityForComment } from '../inserts/insertActivityForComment';

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

  await fillNotificationsWithCommentFollowers(commentId, { account, ...insertResult });
  await fillNotificationsWithAccountFollowers({ account, ...insertResult });
  await fillNewsFeedWithSpaceFollowers(spaceId, { account: author, ...insertResult });
  await fillNewsFeedWithAccountFollowers({ account: author, ...insertResult })
}
