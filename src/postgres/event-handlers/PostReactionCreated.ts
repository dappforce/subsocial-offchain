import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { onCommentReactionCreated } from '.';
import { onRegularOrSharedPostCreated } from './RegularOrSharedctionPostReationCreated';

export const onPostReactionCreated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const postId = data[1] as PostId;
  const post = await substrate.findPost(postId);
  if (!post) return;

  if (post.extension.isComment) {
    onCommentReactionCreated(eventAction, post)
  } else { 
    onRegularOrSharedPostCreated(eventAction, post)
  }
}