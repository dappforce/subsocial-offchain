import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { SubstrateEvent } from '../../substrate/types';
import { upsertPostOrComment } from '../upsert-post';

export const onRootPostUpdated = async (_eventAction: SubstrateEvent, post: Post) => {
  await upsertPostOrComment(post)
}