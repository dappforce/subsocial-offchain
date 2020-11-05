import { SubstrateId } from '@subsocial/types';
import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries/types';
import { encodeStructIds } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { emptyParamsLogError, updateCountLog } from '../postges-logger';
import { getValidDate } from '../../substrate/subscribe';
import { pg } from '../../connections/postgres';
import { newPgError } from '../utils';

const query = `
  INSERT INTO df.activities(block_number, event_index, account, event, post_id, date, agg_count, aggregated)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *`

const queryUpdate = `
  UPDATE df.activities
    SET aggregated = false
    WHERE block_number <> $1
      AND event_index <> $2
      AND event = $3
      AND aggregated = true
      AND post_id = $4
  RETURNING *`;

export async function insertActivityForPostReaction(eventAction: SubstrateEvent, count: number, ids: SubstrateId[], creator: string): InsertActivityPromise {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('post reaction')
    return undefined
  }

  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;

  const date = await getValidDate(blockNumber)
  const params = [blockNumber, eventIndex, accountId, eventName, ...paramsIds, date, count, aggregated];

  try {
    await pg.query(query, params)
    const postId = paramsIds.pop();

    const paramsUpdate = [blockNumber, eventIndex, eventName, postId];
    const resUpdate = await pg.query(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowCount)
  } catch (err) {
    throw newPgError(err, insertActivityForPostReaction)
  }

  return { blockNumber, eventIndex }
};