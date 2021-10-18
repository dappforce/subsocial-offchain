import { log } from '../postges-logger';
import { runQuery } from '../utils';
import { Activity } from '@subsocial/types';
import { encodeStructId } from '../../substrate/utils';

const query = `
  SELECT report_id FROM df.activities as a
  WHERE event = 'EntityReported' AND scope_id = :scopeId AND NOT EXISTS
    (SELECT report_id FROM df.activities as b
    WHERE event = 'EntityStatusUpdated'
      AND scope_id = :scopeId
      AND (a.post_id=b.post_id
          OR a.space_id=b.space_id
          OR a.following_id=b.following_id)
    )`

export async function getReportIdsByScope(scopeId: string) {
  const params = { 
    scopeId: encodeStructId(scopeId)
  };

  try {
    const res = await runQuery(query, params)
    return res.rows[0] as Activity;
  } catch (err) {
    log.error('Failed to get activities:', err.stack)
    throw err
  }
}