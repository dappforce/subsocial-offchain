import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_POSTS } from '../../search/config';
import { substrate } from '../../substrate/subscribe';
import { EventHandlerFn } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';

export const onPostCreated: EventHandlerFn = async (eventAction) => {
  const { postId } = parsePostEvent(eventAction)

  const post = await substrate.findPost({ id: postId });
  if (!post) return;

  await indexContentFromIpfs(ES_INDEX_POSTS, post.content.asIpfs.toString(), postId, post);
}
