import { resolveSubsocialApi } from '../connections/subsocial';
import { shouldHandleEvent } from '../substrate/utils';
import { handleEventForPostgres } from '../substrate/handle-postgres';
import { handleEventForElastic } from '../substrate/handle-elastic';
import { BlockNumber } from '@polkadot/types/interfaces';
import { u32 } from '@polkadot/types/primitive'
import registry from '@subsocial/types/substrate/registry'
import { exit } from 'process'
import { readFileSync } from 'fs';
import { ApiPromise } from '@polkadot/api';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { newLogger } from '@subsocial/utils';

const log = newLogger('Events')

async function processEvents(blockNumber: BlockNumber, api: ApiPromise ) {
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
    const events = await api.query.system.events.at(blockHash)

    for (let i = 0; i < events.length; i++) {
      const { event } = events[i]
      console.log(`${event.method} :::: ${i}`)
      if (shouldHandleEvent(event)) {
        log.debug(`Handle a new event: %o`, event.method)

        const eventMeta = {
          eventName: event.method,
          data: event.data,
          blockNumber: blockNumber,
          eventIndex: i
        }
        await handleEventForPostgres(eventMeta)
        await handleEventForElastic(eventMeta)
      }
    }
}

async function blockFromFileIndexer(substrate: SubsocialSubstrateApi){
  const api = await substrate.api

  const ENV = process.env.NODE_ENV || 'development';
  const buildPath = ENV === 'production' ? 'build/' : '';

  let content = readFileSync(buildPath + 'src/sql/blockNumbers.txt', 'utf-8')
  let blockNumbers = new Set(content.split('\n').sort())

  for (let value of blockNumbers.values()) {
    let blockNumber = new u32(registry, value)
  
    await processEvents(blockNumber, api)

  }
  exit(0)
}

resolveSubsocialApi()
  .then(({ substrate }) => blockFromFileIndexer(substrate))
  .catch((error) => {
    log.error('Unexpected error during processing of Substrate events:', error)
    process.exit(-1)
  })