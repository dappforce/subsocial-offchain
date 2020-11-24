import { log } from '../postges-logger';
import { sql } from '@pgtyped/query';
import { runQuery } from '../utils';
import { IQueryQuery, IQueryParams } from '../types/getAggregationCount.queries';

export type AggCountProps = {
  eventName: string,
  account: string,
  post_id: bigint
}

const query = sql<IQueryQuery>`
  SELECT count(distinct account)
  FROM df.activities
  WHERE account <> $account
    AND event = $event
    AND post_id = $postId`

export async function getAggregationCount(props: AggCountProps) {
  const { eventName, post_id, account } = props;
  const params: IQueryParams = { account, event: eventName, postId: post_id };

  try {
    const res = await runQuery(query, params)
    log.info(`Get ${res[0].count} distinct activities by post id: ${post_id}`)
    return res[0].count as number;
  } catch (err) {
    log.error('Failed to getAggregationCount:', err.stack)
    throw err
  }
}