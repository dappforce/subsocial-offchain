import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';
import { findPost } from '../../substrate/api-wrappers';
import { NormalizedPost } from '../../substrate/normalizers';
import { EntityId } from "@subsocial/types/substrate/interfaces";
import { idToBn } from "@subsocial/utils";
import { resolveSubsocialApi } from "../../connections";
import { parseEntity } from "../../substrate/utils";

type PostHandler = (eventAction: SubstrateEvent, post?: NormalizedPost) => Promise<void>

type PostHandlers = {
  eventAction: SubstrateEvent
  onRootPost: PostHandler
  onComment: PostHandler
}

export const findPostAndProccess = async ({ eventAction, onRootPost, onComment }: PostHandlers) => {
  const { postId } = parsePostEvent(eventAction)
  const post = await findPost(postId)
  if (!post) return;

  if (post.isComment) {
    await onComment(eventAction, post)
  } else {
    await onRootPost(eventAction, post)
  }
}

export const findEntityOwner = async (entity: EntityId) => {
  const { entityId, entityKind } = parseEntity(entity)

  if (entityKind === 'Content') return ''

  if (entityKind === 'Account') return entityId

  const api = await resolveSubsocialApi()

  let owner = ''

  if (entityKind === 'Post') {
    const { struct: { owner: postOwner }} = await api.findPost({id: idToBn(entityId)})
    owner = postOwner.toString()
  } else {
    const { struct: { owner: spaceOwner }} = await api.findSpace({id: idToBn(entityId)})
    owner = spaceOwner.toString()
  }

  return owner.toString()
}