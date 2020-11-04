import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertCommentFollower } from '../insert-follower';
import { insertActivityComments, insertActivityForComment } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNotificationsWithPostFollowers } from '../fill-activity';
import { substrateLog as log } from '../../connections/loggers';
import { SubstrateEvent } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { parseCommentEvent } from '../../substrate/utils';

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
    await insertActivityComments(eventAction, ids, post);
  } else {
    eventAction.eventName = VirtualEvents.CommentCreated
    const insertResult = await insertActivityForComment(eventAction, ids, postCreator);
    if (insertResult === undefined) return;

    log.debug('Comment does not have a parent id');
    await fillNotificationsWithPostFollowers(root_post_id, { account: author, ...insertResult });
    await fillNotificationsWithAccountFollowers({ account: author, ...insertResult });
  }
}
