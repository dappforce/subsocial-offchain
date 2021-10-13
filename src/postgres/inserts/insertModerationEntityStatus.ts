import { GenericEventData } from '@polkadot/types'
import { encodeStructId, parseModerationEntity } from '../../substrate/utils'
import { newPgError, runQuery } from '../utils'
import { IQueryParams } from '../types/insertModerationEntityStatus.queries'
import { AnyAccountId } from '@subsocial/types'
import { EntityId, EntityStatus, SpaceId } from '@subsocial/types/substrate/interfaces'
import { EntityKind } from '../../substrate/types'

const query = `
  INSERT INTO df.moderation(entity_kind, entity_num_id, entity_str_id, scope_id, blocked)
    VALUES(:entityKind, :entityNumId, :entityStrId, :scopeId, :blocked)
  RETURNING *`

type EventTuple = [AnyAccountId, SpaceId, EntityId, EntityStatus]

export async function insertModerationEntityStatus(data: GenericEventData) {
  const [_, scopeIdBn, entityId, entityStatus] = data as unknown as EventTuple

  const scopeId = encodeStructId(scopeIdBn.toString())

  const entityKind = entityId.type as EntityKind
  const entityValue = entityId.value.toString()

  const params = {
    entityKind,
    scopeId,
    ...parseModerationEntity(entityKind, entityValue),
    blocked: entityStatus.isBlocked
  }

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, insertModerationEntityStatus)
  }
}
