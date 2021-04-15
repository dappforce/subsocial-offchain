import { ApiPromise as SubstrateApi } from '@polkadot/api';
import { shouldHandleEvent } from '../substrate/utils';
import { handleEventForPostgres } from '../substrate/handle-postgres';
import { BlockNumber } from '@polkadot/types/interfaces';
import { u32 } from '@polkadot/types/primitive'
import registry from '@subsocial/types/substrate/registry'
import { readFileSync } from 'fs';
import { SubsocialSubstrateApi } from '@subsocial/api'
import { newLogger } from '@subsocial/utils';
import { join } from 'path';
import { OffchainState, CommonDbState, SubstrateEvent } from './types';
import { writeOffchainState } from '../substrate/offchain-state';
import { getUniqueIds } from '@subsocial/api'
import { TEST_MODE } from '../env';
import { stateDirPath } from '../utils';

const log = newLogger('BlockIndexer')

async function processBlockEvents(events: SubstrateEvent[]) {
  for (const event of events) {
    await handleEventForPostgres(event)
  }
}

export function getBlockNumbersFromFile(): BlockNumber[] {
  const strBlockNumbers = readFileSync(join(stateDirPath, '../block-numbers.csv'), 'utf-8').split('\n')

  return getUniqueIds(strBlockNumbers)
    .map(x => new u32(registry, x))
    .sort((a, b) => a.sub(b).toNumber())
}

export async function getBlockEventsFromSubstrate(api: SubstrateApi, blockNumber: BlockNumber): Promise<SubstrateEvent[]> {
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
  const substrateEvents = await api.query.system.events.at(blockHash)

  const events: SubstrateEvent[] = []

  substrateEvents.map(({ event }, i) => {
    if (shouldHandleEvent(event)) {
      // log.debug(`Handle a new event: %o`, event.method)

      events.push({
        eventName: event.method,
        data: event.data,
        blockNumber: blockNumber,
        eventIndex: i
      })
    }
  })

  return events
}

export async function indexBlocksFromFile(substrate: SubsocialSubstrateApi) {
  const api = await substrate.api

  const blockNumbers = getBlockNumbersFromFile()

  log.debug(`${blockNumbers.length} blocks will be reindexed`)

  if (TEST_MODE) {
    let eventsMeta: SubstrateEvent[] = JSON.parse(readFileSync(join(__dirname, '../../../test/input_data/events.json'), 'utf-8'))

    // TODO: remove sort?
    for (const blockNumber of blockNumbers) {
      let blockEvents = eventsMeta
        .filter(x => x.blockNumber == blockNumber)
        .sort((a, b) => a.eventIndex - b.eventIndex)

      for (const event of blockEvents) {
        await handleEventForPostgres(event)
      }
    }
  } else {
    for (const blockNumber of blockNumbers) {
      const blockEvents = await getBlockEventsFromSubstrate(api, blockNumber)
      await processBlockEvents(blockEvents.sort((a, b) => a.eventIndex - b.eventIndex))
    }
  }

  let lastBlock: CommonDbState = { lastBlock: blockNumbers.pop()?.toNumber() }

  let state: OffchainState = { postgres: lastBlock, elastic: lastBlock }
  await writeOffchainState(state)
  log.debug('State is:', lastBlock)
  process.exit(0)
}
