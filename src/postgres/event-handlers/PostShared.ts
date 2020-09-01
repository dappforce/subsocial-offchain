import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { onCommentShared } from './CommentShared';
import { onRootPostShared } from './RootPostShared';
import { findPostAndProccess } from './utils';

export const onPostShared: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  findPostAndProccess({
    onRootPost: onRootPostShared,
    onComment: onCommentShared,
    eventAction
  })
}
