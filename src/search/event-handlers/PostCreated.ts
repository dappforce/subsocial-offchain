import { EventHandlerFn } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { indexPostContent } from '../indexer';
import BN from 'bn.js';
import { resolveSubsocialApi } from '../../connections';

export const onPostCreated: EventHandlerFn = async (eventAction) => {
  const { postId } = parsePostEvent(eventAction)

  const { substrate } = await resolveSubsocialApi()

  const post = await substrate.findPost({ id: new BN(postId) });
  if (!post) return;

  await indexPostContent(post);
}
