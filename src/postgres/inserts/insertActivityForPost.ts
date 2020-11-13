import { SubstrateId } from '@subsocial/types';
import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries/types';
import { encodeStructIds } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { emptyParamsLogError } from '../postges-logger';
import { getValidDate } from '../../substrate/utils';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';
import { getAggregationCount } from '../selects/getAggregationCount';

const query = `
  INSERT INTO df.activities(block_number, event_index, account, event, space_id, post_id, date, agg_count)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *`

export async function insertActivityForPost(eventAction: SubstrateEvent, ids: SubstrateId[], count?: number): InsertActivityPromise {

  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post')
    return undefined
  }

  const [, postId] = paramsIds;
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();

  const date = await getValidDate(blockNumber)
  const newCount = eventName === 'PostShared'
    ? await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId })
    : count;

  const params = [blockNumber, eventIndex, accountId, eventName, ...paramsIds, date, newCount];

  try {
    await pg.query(query, params)
  } catch (err) {
    throw newPgError(err, insertActivityForPost)
  }

  return { blockNumber, eventIndex }
};