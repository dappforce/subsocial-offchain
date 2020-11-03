import { substrate } from '../../connections/connect-subsocial';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { indexPostContent } from './utils';

export const onPostUpdated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { postId } = parsePostEvent(eventAction)

  const post = await substrate.findPost({ id: postId });
  if (!post) return;

  await indexPostContent(post);
}
