import { SubstrateEvent } from '../../substrate/types';
import { InsertActivityPromise } from '../queries';
import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { encodeStructId } from '../../substrate/utils';
import { getValidDate } from '../../substrate/subscribe';
import { pg } from '../../connections';
import { updateCountLog } from '../postges-logger';
import { newPgError } from '../utils';

export async function insertActivityForSpace (eventAction: SubstrateEvent, count: number, creator?: string): InsertActivityPromise {

  const { eventName, data, blockNumber, eventIndex } = eventAction;
  const accountId = data[0].toString();
  const space_id = data[1] as SpaceId
  const spaceId = encodeStructId(space_id);
  const aggregated = accountId !== creator;

  const query = `
    INSERT INTO df.activities(block_number, event_index, account, event, space_id, date, agg_count, aggregated)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`
  const date = await getValidDate(blockNumber)
  const params = [blockNumber, eventIndex, accountId, eventName, spaceId, date, count, aggregated];
  
  try {
    await pg.query(query, params)
    const paramsUpdate = [blockNumber, eventIndex, eventName, spaceId];
    const queryUpdate = `
      UPDATE df.activities
        SET aggregated = false
        WHERE block_number <> $1
          AND event_index <> $2
          AND event = $3
          AND aggregated = true
          AND space_id = $4
      RETURNING *`;

    const resUpdate = await pg.query(queryUpdate, paramsUpdate);
    updateCountLog(resUpdate.rowCount)
  } catch (err) {
    throw newPgError(err, insertActivityForSpace)
  }

  return { blockNumber, eventIndex }
};

/* Вынести каждую постгрес функцию в отдельный файл и раскидать по файлах:
  - inserts
  - deletes
  - fills
  и т.д.

  Переделать функции
  с 
    const fn = async () => {}
  на
    async function () {}
*/