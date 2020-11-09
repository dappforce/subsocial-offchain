import { SubstrateId } from '@subsocial/types';
import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries/types';
import { encodeStructIds } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { emptyParamsLogError, updateCountLog } from '../postges-logger';
import { getValidDate } from '../../substrate/subscribe';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

const query = `
  INSERT INTO df.activities(block_number, event_index, account, event, post_id, comment_id, date, agg_count, aggregated)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *`

const queryUpdate = `
  UPDATE df.activities
    SET aggregated = false
    WHERE aggregated = true
      AND NOT (block_number = $1 AND event_index = $2)
      AND event = $3
      AND post_id = $4
      AND comment_id = $5
  RETURNING *`;

export async function insertActivityForCommentReaction(eventAction: SubstrateEvent, count: number, ids: SubstrateId[], creator: string): InsertActivityPromise {
  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('comment reaction')
    return undefined
  }

  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;

  const date = await getValidDate(blockNumber)
  const params = [blockNumber, eventIndex, accountId, eventName, ...paramsIds, date, count, aggregated];
  
  try {
    await pg.query(query, params)

    const paramsUpdate = [blockNumber, eventIndex, eventName, ...paramsIds];
    const resUpdate = await pg.query(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowCount)
  } catch (err) {
    throw newPgError(err, insertActivityForCommentReaction)
  }

  return { blockNumber, eventIndex }
}