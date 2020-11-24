import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries/types';
import { encodeStructIds } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { emptyParamsLogError, updateCountLog } from '../postges-logger';
import { blockNumberToApproxDate } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryUpdateQuery, IQueryParams, IQueryUpdateParams } from '../types/insertActivityForCommentReaction.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.activities(block_number, event_index, account, event, post_id, comment_id, date, agg_count, aggregated)
    VALUES($blockNumber, $eventIndex, $account, $event, $postId, $commentId, $date, $aggCount, $aggregated)
  RETURNING *`

const queryUpdate = sql<IQueryUpdateQuery>`
  UPDATE df.activities
  SET aggregated = false
  WHERE aggregated = true
    AND NOT (block_number = $blockNumber AND event_index = $eventIndex)
    AND event = $event
    AND post_id = $postId
    AND comment_id = $commentId
  RETURNING *`;

export async function insertActivityForCommentReaction(eventAction: SubstrateEvent, count: number, ids: string[], creator: string): InsertActivityPromise {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('comment reaction')
    return undefined
  }

  const [postId, commentId] = paramsIds
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;

  const date = await blockNumberToApproxDate(blockNumber)
  const params: IQueryParams = { blockNumber, eventIndex, account: accountId, event: eventName, postId, commentId, date, aggCount: count, aggregated };

  try {
    await runQuery(query, params)

    const paramsUpdate: IQueryUpdateParams = { blockNumber, eventIndex, event: eventName, postId, commentId};
    const resUpdate = await runQuery(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.length)
  } catch (err) {
    throw newPgError(err, insertActivityForCommentReaction)
  }

  return { blockNumber, eventIndex }
}