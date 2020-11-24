import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries/types';
import { encodeStructIds } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { emptyParamsLogError, updateCountLog } from '../postges-logger';
import { blockNumberToApproxDate } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryUpdateQuery, IQueryParams, IQueryUpdateParams } from '../types/insertActivityForPostReaction.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.activities(block_number, event_index, account, event, post_id, date, agg_count, aggregated)
    VALUES($blockNumber, $eventIndex, $account, $event, $postId, $date, $aggCount, $aggregated)
  RETURNING *`

const queryUpdate = sql<IQueryUpdateQuery>`
  UPDATE df.activities
  SET aggregated = false
  WHERE aggregated = true
    AND NOT (block_number = $blockNumber AND event_index = $eventIndex)
    AND event = $event
    AND post_id = $postId
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

  const date = await blockNumberToApproxDate(blockNumber)
  const params: IQueryParams = { blockNumber, eventIndex, account: accountId, event: eventName, postId, date, aggCount: count, aggregated };

  try {
    await runQuery(query, params)
    const postId = paramsIds.pop();

    const paramsUpdate: IQueryUpdateParams  = { blockNumber, eventIndex, event: eventName, postId };
    const resUpdate = await runQuery(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.length)
  } catch (err) {
    throw newPgError(err, insertActivityForPostReaction)
  }

  return { blockNumber, eventIndex }
};