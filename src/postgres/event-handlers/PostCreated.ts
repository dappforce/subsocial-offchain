import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { insertPostFollower } from '../insert-follower';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { onCommentCreated } from './CommentCreated';
import { onRootCreated } from './RootPostCreated';

export const onPostCreated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  await insertPostFollower(data);
  const postId = data[1] as PostId;

  const post = await substrate.findPost(postId);
  if (!post) return;

  if (post.extension.isComment) {
    onCommentCreated(eventAction, post)
  } else { 
    onRootCreated(eventAction, post)
  }
}
