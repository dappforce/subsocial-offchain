import { EventHandlerFn } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { indexPostContent } from '../indexer';
import { findPost } from '../../substrate/api-wrappers';

export const onPostCreated: EventHandlerFn = async (eventAction) => {
  const { postId } = parsePostEvent(eventAction)

  const post = await findPost(postId);
  if (!post) return;

  await indexPostContent(post);
}
