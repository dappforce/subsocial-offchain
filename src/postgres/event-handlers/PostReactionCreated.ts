import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { onCommentReactionCreated } from '.';
import { onRootPostReactionCreated } from './RootPostReationCreated';
import { VirtualEvents } from '../../substrate/utils';

export const onPostReactionCreated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const postId = data[1] as PostId;
  const post = await substrate.findPost(postId);
  if (!post) return;

  if (post.extension.isComment) {
    eventAction.eventName = VirtualEvents.CommentReactionCreated
    onCommentReactionCreated(eventAction, post)
  } else { 
    onRootPostReactionCreated(eventAction, post)
  }
}