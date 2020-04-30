import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_COMMENTS } from '../../search/config';
import { CommentId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onCommentUpdated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const commentId = data[1] as CommentId;
  const comment = await substrate.findComment(commentId);
  if (!comment) return;

  await indexContentFromIpfs(ES_INDEX_COMMENTS, comment.ipfs_hash.toString(), commentId);
}
