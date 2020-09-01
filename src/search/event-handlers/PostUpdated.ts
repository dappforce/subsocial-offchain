import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_POSTS } from '../../search/config';
import { substrate } from '../../substrate/subscribe';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';

export const onPostUpdated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { postId } = parsePostEvent(eventAction)

  const post = await substrate.findPost({ id: postId });
  if (!post) return;

  await indexContentFromIpfs(ES_INDEX_POSTS, post.content.asIpfs.toString(), postId);
}
