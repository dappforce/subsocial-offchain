import { EntityId } from "@subsocial/types/substrate/interfaces";
import { idToBn } from "@subsocial/utils";
import { resolveSubsocialApi } from "../../connections";
import { EventHandlerFn } from "../../substrate/types";
import { parseEntity } from "../../substrate/utils";
import { insertActivityForReport } from "../inserts/insertActivityForReport";
import { insertNotificationForOwner } from "../inserts/insertNotificationForOwner";

const findEntityOwner = async (entity: EntityId) => {
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

export const onEntityReported: EventHandlerFn = async (event) => {
  const insertResult = await insertActivityForReport(event)
  if (!insertResult) return

  const owner = await findEntityOwner(event.data[2] as EntityId)
  if (!owner) return

  insertNotificationForOwner({ account: owner, ...event })
}