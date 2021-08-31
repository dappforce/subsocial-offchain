import { EventHandlerFn } from '../../substrate/types';
import { onCommentReactionCreated } from '.';
import { onRootPostReactionCreated } from './RootPostReationCreated';
import { findPostAndProccess } from './utils';

export const onPostReactionCreated: EventHandlerFn = async (eventAction) => {
  await findPostAndProccess({
    onRootPost: onRootPostReactionCreated,
    onComment: onCommentReactionCreated,
    eventAction
  })
}