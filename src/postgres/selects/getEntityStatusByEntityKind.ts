import { runQuery } from '../utils';
import { log } from '../postges-logger';
import { EntityKind } from '../../substrate/types';
import { parseModerationEntity } from '../../substrate/utils';

const query = `
  SELECT scope_id, blocked FROM df.email_settings
  WHERE entity_kind = :entityKind AND (entity_num_id = :entityNumId OR entity_str_id = :entityStrId)`

export const getEntityStatusByEntityKind = async (entityKind: EntityKind, entityValue: string) => {
	try {
		const data = await runQuery(query, { entityKind, ...parseModerationEntity(entityKind, entityValue) })
		return data.rows[0] || {}
	} catch (err) {
		log.error(`Failed to get EntityStatus by ${entityKind}: ${entityValue}`, err.stack)
		throw err
	}
}