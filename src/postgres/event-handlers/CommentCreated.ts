import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrateLog as log } from '../../connections/loggers';
import { SubstrateEvent } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { parseCommentEvent } from '../../substrate/utils';
import { substrate } from '../../connections/subsocial';
import { insertCommentFollower } from '../inserts/insertCommentFollower';
import { insertActivityForComment } from '../inserts/insertActivityForComment';
import { fillNotificationsWithPostFollowers } from '../fills/fillNotificationsWithPostFollowers';
import { fillNotificationsWithAccountFollowers } from '../fills/fillNotificationsWithAccountFollowers';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';

export const onCommentCreated = async (eventAction: SubstrateEvent, post: Post) => {
  const { author, commentId } = parseCommentEvent(eventAction)

  const {
    extension: { asComment: { root_post_id, parent_id } },
  } = post

  const rootPost = await substrate.findPost({ id: root_post_id });

  if (!rootPost) return;

  await insertCommentFollower(eventAction.data);

  const postCreator = rootPost.created.account.toString();
  const ids = [ root_post_id, commentId ];

  if (parent_id.isSome) {
    eventAction.eventName = VirtualEvents.CommentReplyCreated
    log.debug('Comment has a parent id');
    log.debug('parent_id is defined')
    const parentId = parent_id.unwrap();
    const param = [...ids, parentId];
    const parentComment = await substrate.findPost({ id: parentId });

    const parentOwner = parentComment.owner.toString();
    const insertResult = await insertActivityForComment(eventAction, param, author);

    if (author === parentOwner || insertResult === undefined) return;
    await insertNotificationForOwner({ ...insertResult, account: parentOwner });
  } else {
    eventAction.eventName = VirtualEvents.CommentCreated
    const insertResult = await insertActivityForComment(eventAction, ids, postCreator);
    if (insertResult === undefined) return;

    log.debug('Comment does not have a parent id');
    await fillNotificationsWithPostFollowers(root_post_id, { account: author, ...insertResult });
    await fillNotificationsWithAccountFollowers({ account: author, ...insertResult });
  }
}
