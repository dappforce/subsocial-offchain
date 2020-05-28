import { EventHandlerFn } from '../../substrate/types';
import { onCommentDeleted } from './CommentDeleted';
import { onRootPostDeleted } from './RootPostDeleted';
import { findPostAndProccess } from './utils';

export const onPostDeleted: EventHandlerFn = async (eventAction) => {
  findPostAndProccess({
    onRootPost: onRootPostDeleted,
    onComment: onCommentDeleted,
    eventAction
  })
}
