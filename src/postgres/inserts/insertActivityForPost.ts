import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries/types';
import { encodeStructIds, encodeStructId } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { emptyParamsLogError } from '../postges-logger';
import { blockNumberToApproxDate } from '../../substrate/utils';
import { newPgError, runQuery, action } from '../utils';
import { getAggregationCount } from '../selects/getAggregationCount';
import { IQueryParams } from '../types/insertActivityForPost.queries';

const query = `
  INSERT INTO df.activities(block_number, event_index, account, event, space_id, post_id, date, agg_count)
    VALUES(:blockNumber, :eventIndex, :account, :event, :spaceId, :postId, :date, :aggCount)
  ON CONFLICT (block_number, event_index) DO NOTHING;`

export async function insertActivityForPost(eventAction: SubstrateEvent, ids: string[], count?: number): InsertActivityPromise {

  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post')
    return undefined
  }

  const [spaceId, postId] = paramsIds;
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const encodedBlockNumber = encodeStructId(blockNumber.toString())

  const date = await blockNumberToApproxDate(blockNumber)
  const newCount = eventName === 'PostShared'
    ? await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId })
    : count;

  const params = {
    blockNumber: encodedBlockNumber,
    eventIndex,
    account: accountId,
    event: eventName as action,
    spaceId,
    postId,
    date,
    aggCount: newCount
  };

  try {
    await runQuery<IQueryParams>(query, params)
  } catch (err) {
    throw newPgError(err, insertActivityForPost)
  }

  return { blockNumber, eventIndex }
};