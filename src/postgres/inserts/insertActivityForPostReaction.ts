import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries/types';
import { encodeStructIds, encodeStructId } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { emptyParamsLogError, updateCountLog } from '../postges-logger';
import { blockNumberToApproxDate } from '../../substrate/utils';
import { newPgError, runQuery, action } from '../utils';
import { IQueryParams, IQueryUpdateParams } from '../types/insertActivityForPostReaction.queries';

const query = `
  INSERT INTO df.activities(block_number, event_index, account, event, post_id, date, agg_count, aggregated)
    VALUES(:blockNumber, :eventIndex, :account, :event, :postId, :date, :aggCount, :aggregated)
  ON CONFLICT (block_number, event_index) DO NOTHING;`

const queryUpdate = `
  UPDATE df.activities
  SET aggregated = false
  WHERE aggregated = true
    AND NOT (block_number = :blockNumber AND event_index = :eventIndex)
    AND event = :event
    AND post_id = :postId
  RETURNING *`;

export async function insertActivityForPostReaction(eventAction: SubstrateEvent, count: number, ids: string[], creator: string): InsertActivityPromise {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post reaction')
    return undefined
  }

  const [postId] = paramsIds
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  const encodedBlockNumber = encodeStructId(blockNumber.toString())

  const date = await blockNumberToApproxDate(blockNumber)
  const params = {
    blockNumber: encodedBlockNumber,
    eventIndex,
    account: accountId,
    event: eventName as action,
    postId,
    date,
    aggCount: count,
    aggregated
  };

  try {
    await runQuery<IQueryParams>(query, params)
    const postId = paramsIds.pop();

    const paramsUpdate  = { blockNumber: encodedBlockNumber, eventIndex, event: eventName as action, postId };
    const resUpdate = await runQuery<IQueryUpdateParams>(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowsCount)
  } catch (err) {
    throw newPgError(err, insertActivityForPostReaction)
  }

  return { blockNumber, eventIndex }
};