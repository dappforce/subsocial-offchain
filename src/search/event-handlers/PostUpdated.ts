import { substrate } from '../../connections/subsocial';
import { EventHandlerFn } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { indexPostContent } from '../indexer';

export const onPostUpdated: EventHandlerFn = async (eventAction) => {
  const { postId } = parsePostEvent(eventAction)

  const post = await substrate.findPost({ id: postId });
  if (!post) return;

  await indexPostContent(post);
}
