import { GenericEventData } from '@polkadot/types'
import { encodeStructId, parseEntity } from '../../substrate/utils'
import { newPgError, runQuery } from '../utils'
import { IQueryParams } from '../types/insertModerationEntityStatus.queries'
import { AnyAccountId } from '@subsocial/types'
import { EntityId, EntityStatus, SpaceId } from '@subsocial/types/substrate/interfaces'

const query = `
  INSERT INTO df.moderation(entity_kind, entity_id, scope_id, blocked)
    VALUES(:entityKind, :entityId, :scopeId, :blocked)
    ON CONFLICT (entity_kind, entity_id, scope_id) DO UPDATE
    SET blocked = :blocked
  RETURNING *`

type EventTuple = [AnyAccountId, SpaceId, EntityId, EntityStatus]

export async function insertModerationEntityStatus(data: GenericEventData) {
  const [_, scopeIdBn, entity, entityStatus] = data as unknown as EventTuple

  const scopeId = encodeStructId(scopeIdBn.toString())
  const { entityKind, entityId } = parseEntity(entity)

  const params = {
    entityKind,
    scopeId,
    entityId,
    blocked: entityStatus.isBlocked
  }

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, insertModerationEntityStatus)
  }
}
