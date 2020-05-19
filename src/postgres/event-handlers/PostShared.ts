import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { onCommentShared } from './CommentShared';
import { onRootPostShared } from './RootPostShared';

export const onPostShared: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const postId = data[1] as PostId;

  const post = await substrate.findPost(postId);
  if (!post) return;


  if (post.extension.isComment) {
    eventAction.eventName = VirtualEvents.CommentShared
    onCommentShared(eventAction, post)
  } else { 
    onRootPostShared(eventAction, post)
  }
}
