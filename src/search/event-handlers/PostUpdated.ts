import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_POSTS } from '../../search/config';
import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/subscribe';
import { SubstrateEvent, EventHandlerFn } from '../../substrate/types';

export const onPostUpdated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const postId = data[1] as PostId;
  const post = await substrate.findPost(postId);
  if (!post) return;

  await indexContentFromIpfs(ES_INDEX_POSTS, post.ipfs_hash.toString(), postId);
}
