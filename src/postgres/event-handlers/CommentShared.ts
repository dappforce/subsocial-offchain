import { findPost } from '../../substrate/api-wrappers';
import { asNormalizedComment, NormalizedComment } from '../../substrate/normalizers';
import { SubstrateEvent } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { parseCommentEvent } from '../../substrate/utils';
import { fillNotificationsWithAccountFollowers } from '../fills/fillNotificationsWithAccountFollowers';
import { fillNotificationsWithCommentFollowers } from '../fills/fillNotificationsWithCommentFollowers';
import { insertActivityForComment } from '../inserts/insertActivityForComment';
import { informTelegramClientAboutNotifOrFeed } from '../../ws/events';

export const onCommentShared = async (eventAction: SubstrateEvent, comment: NormalizedComment) => {
  const { commentId } = parseCommentEvent(eventAction)

  const { rootPostId } = asNormalizedComment(comment)
  const rootPost = await findPost(rootPostId);
  if (!rootPost) return;

  eventAction.eventName = VirtualEvents.CommentShared
  const spaceId = rootPost.spaceId;
  const ids = [ spaceId, rootPostId, commentId ];
  const account = comment.createdByAccount;

  const insertResult = await insertActivityForComment(eventAction, ids, account);
  if (insertResult === undefined) return;

  await fillNotificationsWithCommentFollowers(commentId, { account, ...insertResult });
  await fillNotificationsWithAccountFollowers({ account, ...insertResult });

  informTelegramClientAboutNotifOrFeed(eventAction.data[0].toString(), account, insertResult.blockNumber, insertResult.eventIndex, 'notification')
  informTelegramClientAboutNotifOrFeed(eventAction.data[0].toString(), account, insertResult.blockNumber, insertResult.eventIndex, 'feed')

}
