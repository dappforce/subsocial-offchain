import { log } from '../postges-logger';
import { runQuery } from '../utils';
import * as BN from 'bn.js';
import { Activity as OldActivity } from '@subsocial/types';

export type Activity = Omit<OldActivity, 'id'> & {
  block_number: string,
  event_index: number
}

const query = `
  SELECT * FROM df.activities
  WHERE account = :account
    AND block_number = :blockNumber
    AND event_index = :eventIndex`

export async function getActivity(account: string, blockNumber: BN, eventIndex: number) {
  const params = { account, blockNumber: blockNumber.toNumber(), eventIndex };

  try {
    const res = await runQuery(query, params)
    return res.rows[0] as Activity;
  } catch (err) {
    log.error('Failed to getAggregationCount:', err.stack)
    throw err
  }
}