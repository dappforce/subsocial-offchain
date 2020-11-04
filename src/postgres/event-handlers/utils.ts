import { SubstrateEvent } from '../../substrate/types';
import { Post } from '@subsocial/types/substrate/interfaces';
import { substrate } from '../../connections/subsocial';
import { parsePostEvent } from '../../substrate/utils';

type PostHandler = (eventAction: SubstrateEvent, post?: Post) => Promise<void>

type PostHandlers = {
  eventAction: SubstrateEvent
  onRootPost: PostHandler
  onComment: PostHandler
}

export const findPostAndProccess = async ({ eventAction, onRootPost, onComment }: PostHandlers) => {
  const { postId } = parsePostEvent(eventAction)
  const post = await substrate.findPost({ id: postId })
  if (!post) return;

  if (post.extension.isComment) {
    onComment(eventAction, post)
  } else {
    onRootPost(eventAction, post)
  }
}