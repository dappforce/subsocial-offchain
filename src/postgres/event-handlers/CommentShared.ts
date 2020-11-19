import { isEmptyStr } from '@subsocial/utils';
import { findPost } from '../../substrate/api-wrappers';
import { asNormalizedComment, NormalizedComment } from '../../substrate/normalizers';
import { SubstrateEvent } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { parseCommentEvent } from '../../substrate/utils';
import { fillNewsFeedWithAccountFollowers } from '../fills/fillNewsFeedWithAccountFollowers';
import { fillNewsFeedWithSpaceFollowers } from '../fills/fillNewsFeedWithSpaceFollowers';
import { fillNotificationsWithAccountFollowers } from '../fills/fillNotificationsWithAccountFollowers';
import { fillNotificationsWithCommentFollowers } from '../fills/fillNotificationsWithCommentFollowers';
import { insertActivityForComment } from '../inserts/insertActivityForComment';

export const onCommentShared = async (eventAction: SubstrateEvent, comment: NormalizedComment) => {
  const { author, commentId } = parseCommentEvent(eventAction)

  const { rootPostId } = asNormalizedComment(comment)
  const rootPost = await findPost(rootPostId);
  if (!rootPost) return;

  eventAction.eventName = VirtualEvents.CommentShared
  const spaceId = !isEmptyStr(rootPost.spaceId) ? rootPost.spaceId : null;
  const ids = [ spaceId, rootPostId, commentId ];
  const account = comment.createdByAccount;

  const insertResult = await insertActivityForComment(eventAction, ids, account);
  if (insertResult === undefined) return;

  await fillNotificationsWithCommentFollowers(commentId, { account, ...insertResult });
  await fillNotificationsWithAccountFollowers({ account, ...insertResult });
  await fillNewsFeedWithSpaceFollowers(spaceId, { account: author, ...insertResult });
  await fillNewsFeedWithAccountFollowers({ account: author, ...insertResult })
}
