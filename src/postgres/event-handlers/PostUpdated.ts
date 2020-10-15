import { EventHandlerFn } from '../../substrate/types';
import { onRootPostUpdated } from './RootPostUpdated';
import { findPostAndProccess } from './utils';
import { onCommentUpdated } from './CommentUpdated';

export const onPostUpdated: EventHandlerFn = async (eventAction) => {
  findPostAndProccess({
    onRootPost: onRootPostUpdated,
    onComment: onCommentUpdated,
    eventAction
  })
}