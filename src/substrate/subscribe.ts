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

  const offchainState = await readOffchainState()

  const lastProcessedBlock = offchainState.Elastic.lastBlock < offchainState.Postgres.lastBlock
    ? offchainState.Elastic.lastBlock
    : offchainState.Postgres.lastBlock

  let blockToProcess = lastProcessedBlock > 0 ? lastProcessedBlock + 1 : 0

  let bestFinalizedBlock = await getBestFinalizedBlock()

  let processPostgres = true
  let processElastic = true

  while (true) {

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
            offchainState.Postgres.lastError = error.stack
            processPostgres = false
          }
        }

        if (processElastic) {
          const error = await handleEventForElastic(eventMeta)
          if (error) {
            offchainState.Elastic.lastError = error.stack
            processElastic = false
          }
        }
      }
    }

    if (processPostgres) {
      offchainState.Postgres.lastBlock += 1
    }

    if (processElastic) {
      offchainState.Elastic.lastBlock += 1
    }

    await writeOffchainState(offchainState)

    if (!processPostgres && !processElastic) {
      log.warn('Both Postgres and Elastic event handlers returned errors. Cannot continue block processing')
      break
    } else {
      blockToProcess++
    }
  }
}

main().catch((error) => {
  log.error('Failed to subscribe to events', error);
  process.exit(-1);
});
