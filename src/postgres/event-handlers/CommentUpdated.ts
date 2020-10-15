import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { SubstrateEvent } from '../../substrate/types';
import { upsertPostOrComment } from '../insert-post';

export const onCommentUpdated = async (_eventAction: SubstrateEvent, post: Post) => {
  await upsertPostOrComment(post)
}