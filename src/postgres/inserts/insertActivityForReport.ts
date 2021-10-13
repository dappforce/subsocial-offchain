import { updateCountLog } from '../postges-logger'
import { newPgError, runQuery, action } from '../utils'
import { SubstrateEvent } from '../../substrate/types'
import { InsertActivityPromise } from '../queries/types'
import { blockNumberToApproxDate, encodeStructIds } from '../../substrate/utils'
import { IQueryParams, IQueryUpdateParams } from '../types/insertActivityForReport.queries'

const query = `
  INSERT INTO df.activities(block_number, event_index, account, event, report_id, scope_id, date)
    VALUES(:blockNumber, :eventIndex, :account, :event, :reportId, :scopeId, :date)
  RETURNING *`

const queryUpdate = `
  UPDATE df.activities
  SET aggregated = false
  WHERE aggregated = true
    AND NOT (block_number = :blockNumber AND event_index = :eventIndex)
    AND event = :event
    AND report_id = :reportId
    AND scope_id = :scopeId
  RETURNING *`

export async function insertActivityForReport(eventAction: SubstrateEvent): InsertActivityPromise {
  const { eventName, data, blockNumber, eventIndex } = eventAction
  const [accountId, scopeIdBn, _, reportIdBn] = data // TODO: add entity to activity

  const date = await blockNumberToApproxDate(blockNumber)

  const [encodedBlockNumber, scopeId, reportId] = encodeStructIds([
    blockNumber.toString(),
    scopeIdBn.toString(),
    reportIdBn.toString()
  ])

  const params = {
    blockNumber: encodedBlockNumber,
    eventIndex,
    account: accountId.toString(),
    event: eventName as action,
    scopeId,
    reportId,
    date
  }

  try {
    await runQuery<IQueryParams>(query, params)

    const paramsUpdate = {
      blockNumber: encodedBlockNumber,
      eventIndex,
      event: eventName as action,
      scopeId,
      reportId,
    }
    const resUpdate = await runQuery<IQueryUpdateParams>(queryUpdate, paramsUpdate)
    updateCountLog(resUpdate.rowsCount)
  } catch (err) {
    throw newPgError(err, insertActivityForReport)
  }

  return { blockNumber, eventIndex }
}
