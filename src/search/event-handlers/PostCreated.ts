import { substrate } from '../../connections/subsocial';
import { EventHandlerFn } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { indexPostContent } from '../indexer';
import * as BN from 'bn.js';

export const onPostCreated: EventHandlerFn = async (eventAction) => {
  const { postId } = parsePostEvent(eventAction)

  const post = await substrate.findPost({ id: new BN(postId) });
  if (!post) return;

  await indexPostContent(post);
}
