import { runQuery } from '../utils';
import { log } from '../postges-logger';
import { EntityKind } from '../../substrate/types';

const query = `
  SELECT scope_id, blocked FROM df.moderation
  WHERE entity_kind = :entityKind AND entity_id = :entityId`

export const getEntityStatusByEntityKind = async (entityKind: EntityKind, entityId: string) => {
	try {
		const data = await runQuery(query, { entityKind, entityId })
		return data.rows || []
	} catch (err) {
		log.error(`Failed to get EntityStatus by ${entityKind}: ${entityId}`, err.stack)
		throw err
	}
}