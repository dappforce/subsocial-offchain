import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries';
import { encodeStructId } from '../../substrate/utils';
import { blockNumberToApproxDate } from '../../substrate/utils';
import { updateCountLog } from '../postges-logger';
import { newPgError, runQuery } from '../utils';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryUpdateQuery, IQueryParams, IQueryUpdateParams, IQueryUpdateResult } from '../types/insertActivityForSpace.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.activities(block_number, event_index, account, event, space_id, date, agg_count, aggregated)
    VALUES($blockNumber, $eventIndex, $account, $event, $spaceId, $date, $aggCount, $aggregated)
  RETURNING *`

const queryUpdate = sql<IQueryUpdateQuery>`
  UPDATE df.activities
  SET aggregated = false
  WHERE aggregated = true
    AND NOT (block_number = $blockNumber AND event_index = $eventIndex)
    AND event = $event
    AND space_id = $spaceId
  RETURNING *`;

export async function insertActivityForSpace (eventAction: SubstrateEvent, count: number, creator?: string): InsertActivityPromise {
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const space_id = data[1].toString()
  const spaceId = encodeStructId(space_id);
  const aggregated = accountId !== creator;

  const date = await blockNumberToApproxDate(blockNumber)
  const params: IQueryParams = { blockNumber, eventIndex, account: accountId, event: eventName, spaceId, date, aggCount: count, aggregated };

  try {
    await runQuery(query, params)
    const paramsUpdate: IQueryUpdateParams = { blockNumber, eventIndex, event: eventName, spaceId };

    const resUpdate: IQueryUpdateResult[] = await runQuery(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.length)
  } catch (err) {
    throw newPgError(err, insertActivityForSpace)
  }

  return { blockNumber, eventIndex }
};