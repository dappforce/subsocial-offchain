import { newPgError, runQuery, action } from '../utils'
import { SubstrateEvent } from '../../substrate/types'
import { InsertActivityPromise } from '../queries/types'
import { blockNumberToApproxDate, encodeStructIds, parseActivityFromEntity, parseEntity } from '../../substrate/utils'
import { IQueryParams } from '../types/insertActivityForReportStatus.queries'
import { EntityId } from '@subsocial/types/substrate/interfaces'

const query = `
  INSERT INTO df.activities(block_number, event_index, account, event, following_id, space_id, post_id, scope_id, date)
    VALUES(:blockNumber, :eventIndex, :account, :event, :followingId, :spaceId, :postId, :scopeId, :date)
  RETURNING *`

export async function insertActivityForReportStatus(eventAction: SubstrateEvent): InsertActivityPromise {
  const { eventName, data, blockNumber, eventIndex } = eventAction
  const [accountId, scopeIdBn, entity] = data

  const date = await blockNumberToApproxDate(blockNumber)

  const [encodedBlockNumber, scopeId] = encodeStructIds([
    blockNumber.toString(),
    scopeIdBn.toString(),
  ])

  const params = {
    blockNumber: encodedBlockNumber,
    eventIndex,
    account: accountId.toString(),
    event: eventName as action,
    scopeId,
    date,
    ...parseActivityFromEntity(parseEntity(entity as EntityId))
  }

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, insertActivityForReportStatus)
  }

  return { blockNumber, eventIndex }
}