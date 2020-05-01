import { BlockNumber, Hash, Event } from '@polkadot/types/interfaces';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { Api } from '@subsocial/api/substrateConnect';
import { substrateLog as log } from '../connections/loggers';
import { eventsFilterMethods, eventsFilterSections } from './utils';
import { readOffchainState, writeOffchainState } from './offchain-state';
import { handleEventForElastic } from './handle-elastic';
import { handleEventForPostgres } from './handle-postgres';

require('dotenv').config();

export let substrate: SubsocialSubstrateApi;

function shouldHandleEvent (event: Event): boolean {
  return (
    eventsFilterSections.includes(event.section.toString()) && 
    eventsFilterMethods.includes(event.method.toString())
  ) || eventsFilterSections.includes('all')
}

async function main () {
  log.info(`Subscribe to Substrate events: ${eventsFilterMethods}`);

  // Connect to Substrate node:
  const api = await Api.connect(process.env.SUBSTRATE_URL)
  substrate = new SubsocialSubstrateApi(api);

  const getBestFinalizedBlock = async () =>
    (await api.derive.chain.bestNumberFinalized())

  const blockTime = api.consts.timestamp?.minimumPeriod.muln(2).toNumber();

  const waitNextBlock = async () =>
    new Promise(r => setTimeout(r, blockTime))

  const state = await readOffchainState()

  const lastPostgresBlock = () => state.postgres.lastBlock
  const lastElasticBlock = () => state.elastic.lastBlock

  let bestFinalizedBlock = await getBestFinalizedBlock()
  let blockToProcess = 0
  let processPostgres = false
  let processElastic = false

  while (true) {

    // Doesn't matter if both Postgres and Elastic have the same last block number:
    blockToProcess = lastPostgresBlock()
    processPostgres = false
    processElastic = false
    
    if (lastElasticBlock() < lastPostgresBlock()) {
      blockToProcess = lastElasticBlock()
      processElastic = true
    } else if (lastPostgresBlock() < lastElasticBlock()) {
      blockToProcess = lastPostgresBlock()
      processPostgres = true
    } else {
      processPostgres = true
      processElastic = true
    }

    blockToProcess++

    if (bestFinalizedBlock.toNumber() < blockToProcess) {
      log.debug('Waiting for the best finalized block...')
      await waitNextBlock()
      bestFinalizedBlock = await getBestFinalizedBlock()
      continue
    }

    const blockNumber: BlockNumber = api.createType('BlockNumber', blockToProcess)
    const blockHash: Hash = await api.rpc.chain.getBlockHash(blockNumber)
    const events = await api.query.system.events.at(blockHash)

    log.debug(`Best finalized block: ${bestFinalizedBlock.toString()}`)
    log.debug(`Block number to process: ${blockToProcess} with hash ${blockHash.toHex()}`)

    // Process all events of the current block
    for (const { event } of events) {
      if (shouldHandleEvent(event)) {
        log.debug(`Handle a new event: %o`, event.data)
        const eventMeta = {
          eventName: event.method,
          data: event.data,
          blockHeight: blockNumber
        }

        if (processPostgres) {
          const error = await handleEventForPostgres(eventMeta)
          if (error) {
            processPostgres = false
            state.postgres.lastError = error.stack
            state.postgres.lastBlock = blockToProcess - 1
          }
        }

        if (processElastic) {
          const error = await handleEventForElastic(eventMeta)
          if (error) {
            processElastic = false
            state.elastic.lastError = error.stack
            state.elastic.lastBlock = blockToProcess - 1
          }
        }
      }
    }

    if (processPostgres) {
      delete state.postgres.lastError
      state.postgres.lastBlock = blockToProcess
    }

    if (processElastic) {
      delete state.elastic.lastError
      state.elastic.lastBlock = blockToProcess
    }

    await writeOffchainState(state)

    if (!processPostgres && !processElastic) {
      log.warn('Both Postgres and Elastic event handlers returned errors. Cannot continue block processing')
      break
    }
  }
}

main().catch((error) => {
  log.error('Failed to subscribe to events', error);
  process.exit(-1);
});
