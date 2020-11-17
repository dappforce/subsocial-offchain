import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { findPost } from '../../substrate/api-wrappers';
import { NormalizedPost } from '../../substrate/normalizers';

type PostHandler = (eventAction: SubstrateEvent, post?: NormalizedPost) => Promise<void>

type PostHandlers = {
  eventAction: SubstrateEvent
  onRootPost: PostHandler
  onComment: PostHandler
}

export const findPostAndProccess = async ({ eventAction, onRootPost, onComment }: PostHandlers) => {
  const { postId } = parsePostEvent(eventAction)
  const post = await findPost(postId)
  if (!post) return;
  
  if (post.isComment) {
    onComment(eventAction, post)
  } else {
    onRootPost(eventAction, post)
  }
}