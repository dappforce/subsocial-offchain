/* eslint-disable @typescript-eslint/no-misused-promises */
import { BlockNumber, Hash } from '@polkadot/types/interfaces';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { Api } from '@subsocial/api/substrateConnect';
import { substrateLog as log } from '../connections/loggers';
import { eventsFilterMethods } from './utils';
import { readOffchainState, writeOffchainState } from './offchain-state';
import { processEventRecord } from './process-event';
import BN from 'bn.js';

require('dotenv').config();

export let substrate: SubsocialSubstrateApi;

const ONE = new BN(1)

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

  let blockToProcess = new BN(lastProcessedBlock > 0 ? lastProcessedBlock + 1 : 0)

  let bestFinalizedBlock = await getBestFinalizedBlock()

  while (true) {

    if (bestFinalizedBlock.lt(blockToProcess)) {
      log.debug('Waiting for the best finalized block...')
      await waitNextBlock()
      bestFinalizedBlock = await getBestFinalizedBlock()
      continue
    }

    log.debug(`Best finalized block: ${bestFinalizedBlock.toString()}`)
    log.debug(`Block number to process: ${blockToProcess.toString()}`)

    const blockNumber: BlockNumber = api.createType('BlockNumber', blockToProcess)
    const blockHash: Hash = await api.rpc.chain.getBlockHash(blockNumber)
    const events = await api.query.system.events.at(blockHash)

    // Process all events of the current block
    for (const event of events) {
      await processEventRecord({
        event,
        blockNumber,
        blockHash,
        offchainState
      })
    }

    if (!offchainState.Postgres.lastError) {
      offchainState.Postgres.lastBlock += 1
    }

    if (!offchainState.Elastic.lastError) {
      offchainState.Elastic.lastBlock += 1
    }

    await writeOffchainState(offchainState)

    if (offchainState.Postgres.lastError && offchainState.Elastic.lastError) {
      log.warn('Both Postgres and Elastic event handlers returned errors. Cannot continue block processing')
      break
    } else {
      blockToProcess = blockToProcess.add(ONE)
    }
  }
}

main().catch((error) => {
  log.error('Failed to subscribe to events', error);
  process.exit(-1);
});
