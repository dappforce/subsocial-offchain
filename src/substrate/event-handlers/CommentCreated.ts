import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_COMMENTS } from '../../search/config';
import { CommentId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../server';
import { insertCommentFollower } from '../../postgres/insert-follower';
import { insertActivityComments, insertActivityForComment } from '../../postgres/insert-activity';
import { fillNotificationsWithAccountFollowers, fillNotificationsWithPostFollowers } from '../../postgres/fill-activity';
import { substrateLog as log } from '../../connections/loggers';
import { SubstrateEvent } from '../types';

export const onCommentCreated = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  await insertCommentFollower(data);
  const commentId = data[1] as CommentId;
  const comment = await substrate.findComment(commentId);
  if (!comment) return;

  const postId = comment.post_id;
  const post = await substrate.findPost(postId);
  if (!post) return;

  const postCreator = post.created.account.toString();
  const commentCreator = comment.created.account.toString();
  const ids = [ postId, commentId ];
  if (comment.parent_id.isSome) {
    log.debug('Comment has a parent id');
    insertActivityComments(eventAction, ids, comment);
  } else {
    const activityId = await insertActivityForComment(eventAction, ids, postCreator);
    if (activityId === -1) return;

    log.debug('Comment does not have a parent id');
    await fillNotificationsWithPostFollowers(postId, commentCreator, activityId);
    await fillNotificationsWithAccountFollowers(commentCreator, activityId);
  }
  indexContentFromIpfs(ES_INDEX_COMMENTS, comment.ipfs_hash.toString(), commentId);
}
