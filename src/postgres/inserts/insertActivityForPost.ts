import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries/types';
import { encodeStructIds } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { emptyParamsLogError } from '../postges-logger';
import { blockNumberToApproxDate } from '../../substrate/utils';
import { newPgError, runQuery } from '../utils';
import { getAggregationCount } from '../selects/getAggregationCount';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams } from '../types/insertActivityForPost.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.activities(block_number, event_index, account, event, space_id, post_id, date, agg_count)
    VALUES($blockNumber, $eventIndex, $account, $event, $spaceId, $postId, $date, $aggCount)
  RETURNING *`

export async function insertActivityForPost(eventAction: SubstrateEvent, ids: string[], count?: number): InsertActivityPromise {

  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post')
    return undefined
  }

  const [spaceId, postId] = paramsIds;
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();

  const date = await blockNumberToApproxDate(blockNumber)
  const newCount = eventName === 'PostShared'
    ? await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId })
    : count;

  const params: IQueryParams = { blockNumber, eventIndex, account: accountId, event: eventName, spaceId, postId, date, aggCount: newCount };

  try {
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, insertActivityForPost)
  }

  return { blockNumber, eventIndex }
};