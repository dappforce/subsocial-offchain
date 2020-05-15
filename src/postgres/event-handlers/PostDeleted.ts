import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { substrate } from '../../substrate/subscribe';
import { onCommentDeleted } from './CommentDeleted';
import { onRootPostDeleted } from './RootPostDeleted';

export const onPostDeleted: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const postId = data[1] as PostId;

  const { extension: { isComment } } = await substrate.findPost(postId)

  if (isComment) {
    onCommentDeleted(eventAction)
  } else {
    onRootPostDeleted(eventAction)
  }
}
