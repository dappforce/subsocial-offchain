import { updateCountLog } from '../postges-logger';
import { newPgError, runQuery } from '../utils';
import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries/types';
import { blockNumberToApproxDate } from '../../substrate/utils';
import { sql } from '@pgtyped/query';
import { IQueryQuery, IQueryParams, IQueryUpdateQuery, IQueryUpdateParams, IQueryUpdateResult } from '../types/insertActivityForAccount.queries';

const query = sql<IQueryQuery>`
  INSERT INTO df.activities(block_number, event_index, account, event, following_id, date, agg_count)
    VALUES($blockNumber, $eventIndex, $account, $event, $followingId, $date, $aggCount)
  RETURNING *`

const queryUpdate = sql<IQueryUpdateQuery>`
  UPDATE df.activities
  SET aggregated = false
  WHERE aggregated = true
    AND NOT (block_number = $blockNumber AND event_index = $eventIndex)
    AND event = $event
    AND following_id = $followingId
  RETURNING *`;

export async function insertActivityForAccount(eventAction: SubstrateEvent, count: number): InsertActivityPromise {
  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const followingId = data[1].toString();

  const date = await blockNumberToApproxDate(blockNumber)

  const params: IQueryParams = { blockNumber, eventIndex, account: accountId, event: eventName, followingId, date, aggCount: count };

  try {
    await runQuery(query, params)

    const paramsUpdate: IQueryUpdateParams = { blockNumber, eventIndex, event: eventName, followingId };
    const resUpdate: IQueryUpdateResult[] = await runQuery(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.length)
  } catch (err) {
    throw newPgError(err, insertActivityForAccount)
  }

  return { blockNumber, eventIndex }
};