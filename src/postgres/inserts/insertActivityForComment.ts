import { SubstrateEvent } from '../../substrate/types';
import { emptyParamsLogError, updateCountLog } from '../postges-logger';
import { encodeStructIds } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { InsertActivityPromise } from '../queries/types';
import { blockNumberToApproxDate } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { getAggregationCount } from '../selects/getAggregationCount';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams, IQueryUpdateIfParentIdQuery, IQueryUpdateIfNotParentIdQuery, IQueryUpdateIfParentIdParams, IQueryUpdateIfParentIdResult } from '../types/insertActivityForComment.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.activities(block_number, event_index, account, event, post_id, comment_id, parent_comment_id, date, agg_count, aggregated)
    VALUES($blockNumber, $eventIndex, $account, $event, $postId, $commentId, $parentCommentId, $date, $aggCount, $aggregated)
  RETURNING *`

const queryUpdateIfParentId = sql<IQueryUpdateIfParentIdQuery>`
  UPDATE df.activities
  SET aggregated = false
  WHERE aggregated = true
    AND NOT (block_number = $blockNumber AND event_index = $eventIndex)
    AND event = $event
    AND post_id = $postId
    AND parent_comment_id IS NULL
  RETURNING *`;

  const queryUpdateIfNotParentId = sql<IQueryUpdateIfNotParentIdQuery>`
  UPDATE df.activities
  SET aggregated = false
  WHERE aggregated = true
    AND NOT (block_number = $blockNumber AND event_index = $eventIndex)
    AND event = $event
    AND post_id = $postId
    AND parent_comment_id = $parentCommentId
  RETURNING *`;


export async function insertActivityForComment(eventAction: SubstrateEvent, ids: string[], creator: string): InsertActivityPromise {

  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('comment')
    return undefined
  }

  if (paramsIds.length !== 3) {
    paramsIds.push(null);
  }

  const [postId, commentId, parentCommentId] = paramsIds;
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;
  console.log(accountId)

  const date = await blockNumberToApproxDate(blockNumber)
  const count = await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId });
  const params: IQueryParams = {
    blockNumber,
    eventIndex,
    account: accountId,
    event: eventName,
    postId,
    commentId,
    parentCommentId,
    date,
    aggCount: count,
    aggregated
  };

  try {
    await runQuery(query, params)

    const [postId, , parentId] = paramsIds;
    let queryUpdate;
    const paramsIdsUpd = { postId, parentId };
    if (!parentId) {
      queryUpdate = queryUpdateIfParentId
    } else {
      queryUpdate = queryUpdateIfNotParentId;
      paramsIdsUpd.parentId = parentId;
    }

    // log.debug('Params of update query:', paramsIdsUpd);
    // log.debug(`parentId query: ${parentEq}, value: ${parentId}`);
    const paramsUpdate: IQueryUpdateIfParentIdParams = { blockNumber, eventIndex, event: eventName, postId: paramsIdsUpd.postId, parentCommentId: paramsIdsUpd.parentId } ;
    const resUpdate: IQueryUpdateIfParentIdResult[] = await runQuery(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.length)
  } catch (err) {
    throw newPgError(err, insertActivityForComment)
  }

  return { blockNumber, eventIndex }
};