import { runQuery } from '../utils';
import { log } from '../postges-logger';
import { IQueryParams } from '../types/getSessionKey.querys';
import { GenericAccountId } from '@polkadot/types';
import registry from '@subsocial/types/substrate/registry';
import { stringToU8a } from '@polkadot/util';

const query = `
  SELECT * FROM df.session_keys
  WHERE main_key = :mainKey AND session_key = :sessionKey`

export const isOwner = async (mainKey: string, sessionKey: string): Promise<boolean> => {
  const sessionKeyGeneric = new GenericAccountId(registry, stringToU8a(sessionKey))

  try {
    const data = await runQuery<IQueryParams>(query, { mainKey, sessionKey: sessionKeyGeneric.toString() })
      if (data.rowCount) return true

      return false
    } catch (err) {
    log.error(`Failed to get session key by account: ${mainKey}`, err.stack)
    throw err
  }
}