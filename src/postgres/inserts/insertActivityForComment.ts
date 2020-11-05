import { SubstrateId } from '@subsocial/types';
import { SubstrateEvent } from '../../substrate/types';
import { log, emptyParamsLogError, updateCountLog } from '../postges-logger';
import { encodeStructIds } from '../../substrate/utils';
import { isEmptyArray } from '@subsocial/utils';
import { InsertActivityPromise } from '../queries/types';
import { getValidDate } from '../../substrate/subscribe';
import { getAggregationCount } from '../notifications';
import { newPgError } from '../utils';
import { pg } from '../../connections/postgres';

export const insertActivityForComment = async (eventAction: SubstrateEvent, ids: SubstrateId[], creator: string): InsertActivityPromise => {

  const paramsIds = encodeStructIds(ids)

  if (isEmptyArray(paramsIds)) {
    emptyParamsLogError('comment')
    return undefined
  }

  if (paramsIds.length !== 3) {
    paramsIds.push(null);
  }

  const [postId] = paramsIds;
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const aggregated = accountId !== creator;

  const query = `
    INSERT INTO df.activities(block_number, event_index, account, event, post_id, comment_id, parent_comment_id, date, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`

  const date = await getValidDate(blockNumber)
  const count = await getAggregationCount({ eventName: eventName, account: accountId, post_id: postId });
  const params = [blockNumber, eventIndex, accountId, eventName, ...paramsIds, date, count, aggregated];

  try {
    await pg.query(query, params)

    const [postId, , parentId] = paramsIds;
    let parentEq = '';
    const paramsIdsUpd = [postId];
    if (!parentId) {
      parentEq += 'AND parent_comment_id IS NULL'
    } else {
      parentEq = 'AND parent_comment_id = $5';
      paramsIdsUpd.push(parentId);
    }
    const queryUpdate = `
      UPDATE df.activities
        SET aggregated = false
        WHERE block_number <> $1
          AND event_index <> $2
          AND event = $3
          AND post_id = $4
          ${parentEq}
          AND aggregated = true
      RETURNING *`;

    log.debug('Params of update query:', [...paramsIdsUpd]);
    log.debug(`parentId query: ${parentEq}, value: ${parentId}`);
    const paramsUpdate = [blockNumber, eventIndex, eventName, ...paramsIdsUpd];
    const resUpdate = await pg.query(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowCount)
  } catch (err) {
    throw newPgError(err, insertActivityForComment)
  }

  return { blockNumber, eventIndex }
};