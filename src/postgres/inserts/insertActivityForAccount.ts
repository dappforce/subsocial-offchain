import { updateCountLog } from '../postges-logger';
import { newPgError, runQuery, action } from '../utils';
import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries/types';
import { blockNumberToApproxDate, encodeStructId } from '../../substrate/utils';
import { IQueryParams, IQueryUpdateParams } from '../types/insertActivityForAccount.queries';

const query = `
  INSERT INTO df.activities(block_number, event_index, account, event, following_id, date, agg_count)
    VALUES(:blockNumber, :eventIndex, :account, :event, :followingId, :date, :aggCount)
  RETURNING *`

const queryUpdate = `
  UPDATE df.activities
  SET aggregated = false
  WHERE aggregated = true
    AND NOT (block_number = :blockNumber AND event_index = :eventIndex)
    AND event = :event
    AND following_id = :followingId
  RETURNING *`;

export async function insertActivityForAccount(eventAction: SubstrateEvent, count: number): InsertActivityPromise {
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const followingId = data[1].toString();

  const date = await blockNumberToApproxDate(blockNumber)
  const encodedBlockNumber = encodeStructId(blockNumber.toString())

  const params = {
    blockNumber: encodedBlockNumber,
    eventIndex,
    account: accountId,
    event: eventName as action,
    followingId,
    date,
    aggCount: count
  };

  try {
    await runQuery<IQueryParams>(query, params)

    const paramsUpdate = { blockNumber: encodedBlockNumber, eventIndex, event: eventName as action, followingId };
    const resUpdate = await runQuery<IQueryUpdateParams>(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowsCount)
  } catch (err) {
    throw newPgError(err, insertActivityForAccount)
  }

  return { blockNumber, eventIndex }
};