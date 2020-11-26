import { log } from '../postges-logger';
import { runQuery,action } from '../utils';
import { IQueryParams } from '../types/getAggregationCount.queries';

export type AggCountProps = {
  eventName: string,
  account: string,
  post_id: bigint
}

const query = `
  SELECT count(distinct account)
  FROM df.activities
  WHERE account <> :account
    AND event = :event
    AND post_id = :postId`

export async function getAggregationCount(props: AggCountProps) {
  const { eventName, post_id, account } = props;
  const params = { account, event: eventName as action, postId: post_id };

  try {
    const res = await runQuery<IQueryParams>(query, params)
    log.info(`Get ${res.rows[0].count} distinct activities by post id: ${post_id}`)
    return res.rows[0].count as number;
  } catch (err) {
    log.error('Failed to getAggregationCount:', err.stack)
    throw err
  }
}