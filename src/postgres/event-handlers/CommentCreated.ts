import { Post, PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertCommentFollower } from '../insert-follower';
import { insertActivityComments, insertActivityForComment } from '../insert-activity';
import { fillNotificationsWithAccountFollowers, fillNotificationsWithPostFollowers } from '../fill-activity';
import { substrateLog as log } from '../../connections/loggers';
import { SubstrateEvent } from '../../substrate/types';

export const onCommentCreated = async (eventAction: SubstrateEvent, post: Post) => {
  const { data } = eventAction;
  await insertCommentFollower(data);
  const commentId = data[1] as PostId;

  const {
    extension: { asComment: { root_post_id, parent_id } },
    created: { account }
  } = post

  const rootPost = await substrate.findPost(root_post_id);

  if (!rootPost) return;

  const postCreator = rootPost.created.account.toString();
  const commentCreator = account.toString();
  const ids = [ root_post_id, commentId ];
  if (parent_id.isSome) {
    log.debug('Comment has a parent id');
    await insertActivityComments(eventAction, ids, post);
  } else {
    const activityId = await insertActivityForComment(eventAction, ids, postCreator);
    if (activityId === -1) return;

    log.debug('Comment does not have a parent id');
    await fillNotificationsWithPostFollowers(root_post_id, commentCreator, activityId);
    await fillNotificationsWithAccountFollowers(commentCreator, activityId);
  }
}
