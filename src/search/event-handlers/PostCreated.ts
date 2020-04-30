import { indexContentFromIpfs } from '../../search/indexer';
import { ES_INDEX_POSTS } from '../../search/config';
import { PostId } from '@subsocial/types/substrate/interfaces/subsocial';
import { substrate } from '../../substrate/server';
import { SubstrateEvent, EventHandlerFn, HandlerResultOK } from '../../substrate/types';

export const onPostCreated: EventHandlerFn = async (eventAction: SubstrateEvent) => {
  const { data } = eventAction;
  const postId = data[1] as PostId;

  const post = await substrate.findPost(postId);
  if (!post) return HandlerResultOK;

  indexContentFromIpfs(ES_INDEX_POSTS, post.ipfs_hash.toString(), postId);
  return HandlerResultOK;
}
