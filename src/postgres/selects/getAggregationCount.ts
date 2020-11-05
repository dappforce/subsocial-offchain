import { log } from '../postges-logger';
import { pg } from '../../connections/postgres';

export type AggCountProps = {
  eventName: string,
  account: string,
  post_id: bigint
}

const query = `
  SELECT count(distinct account)
  FROM df.activities
  WHERE account <> $1
    AND event = $2
    AND post_id = $3`

export async function getAggregationCount(props: AggCountProps) {
  const { eventName, post_id, account } = props;
  const params = [ account, eventName, post_id ];

  try {
    const res = await pg.query(query, params)
    log.info(`Get ${res.rows[0].count} distinct activities by post id: ${post_id}`)
    return res.rows[0].count as number;
  } catch (err) {
    log.error('Failed to getAggregationCount:', err.stack)
    throw err
  }
}