/* eslint-disable @typescript-eslint/no-misused-promises */
import { BlockNumber, Event, EventRecord, Hash } from '@polkadot/types/interfaces';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { Api } from '@subsocial/api/substrateConnect';
import { ApiPromise } from '@polkadot/api'
import { notDef } from '@subsocial/utils';
import { readFile, writeFile } from 'fs';
import { substrateLog as log } from '../connections/loggers';
import { DispatchForDb } from './subscribe';
import { eventsFilterMethods, eventsFilterSections } from './utils';
import { promisify } from 'util'

const asyncReadFile = promisify(readFile)
const asyncWriteFile = promisify(writeFile)
const stateFilePath = `${__dirname}/../state.json`

export let substrate: SubsocialSubstrateApi;

require('dotenv').config();

async function readOffchainState (): Promise<OffchainState> {
  let state = defaultOffchainState()
  try {
    const json = await asyncReadFile(stateFilePath, 'utf8')
    state = JSON.parse(json) as OffchainState
  } catch (err) {
    log.error(`Failed to read offchain state from file: ${stateFilePath}`)
  }
  return state
}

// Register types before creating the API: registerCustomTypes();
// Create the API and wait until ready:
// code from https://polkadot.js.org/api/examples/rx/08_system_events/
async function main () {
  
  log.info(`Subscribe to Substrate events: ${eventsFilterMethods}`);

  // initialize the data service
  // internally connects to all storage sinks
  const api = await Api.connect(process.env.SUBSTRATE_URL)
  substrate = new SubsocialSubstrateApi(api);

  const slotDuration = api.consts.timestamp?.minimumPeriod.muln(2).toNumber();
  const offchainState = await readOffchainState()
  const startFromBlock = process.env.SUBSTRATE_START_FROM_BLOCK || 0

  let lastKnownBestFinalized = (
    await api.derive.chain.bestNumberFinalized()
  ).toNumber()

  while (true) {
    const lastBlock = offchainState.Elastic.lastBlock < offchainState.Postgres.lastBlock
    ? offchainState.Elastic.lastBlock
    : offchainState.Postgres.lastBlock

    const blockIndex = lastBlock >= startFromBlock
      ? lastBlock
      : startFromBlock

    if (blockIndex > lastKnownBestFinalized) {
      log.warn('Waiting for finalization...')

      const bestFinalizedBlock = (await api.derive.chain.bestNumberFinalized()).toNumber();
      lastKnownBestFinalized = bestFinalizedBlock;

      await new Promise(r => setTimeout(r, slotDuration));
      continue;
    }

    const blockNumber: BlockNumber = api.createType('BlockNumber', blockIndex)
    const blockHash: Hash = await api.rpc.chain.getBlockHash(blockNumber)

    log.debug(`Block index: ${blockIndex}`)
    log.debug(`Last known best finalized: ${lastKnownBestFinalized}`)
    log.debug(`Block hash: ${blockHash}`)

    const events = await api.query.system.events.at(blockHash)
    // Process all events of the current block
    for(const record of events) {
      await processEventRecord(api, record, offchainState)
    }

    if (notDef(offchainState.Postgres.lastError)) {
      offchainState.Postgres.lastBlock += 1
    }
    if (notDef(offchainState.Elastic.lastError)) {
      offchainState.Elastic.lastBlock += 1
    }
    const json = JSON.stringify(offchainState);
    await asyncWriteFile(stateFilePath, json, 'utf8');
  }
}

function shouldProcessEvent (event: Event): boolean {
  return (
    eventsFilterSections.includes(event.section.toString()) && 
    eventsFilterMethods.includes(event.method.toString())
  ) || eventsFilterSections.includes('all')
}

async function processEventRecord (api: ApiPromise, record: EventRecord, state: OffchainState) {
  // extract the event object
  const { event } = record;
  if (!shouldProcessEvent(event)) return;

  const blockHash = await api.rpc.chain.getFinalizedHead();
  const header = await api.rpc.chain.getHeader(blockHash);

  // create event object for data sink
  const eventObj = {
    section: event.section,
    method: event.method,
    meta: event.meta.documentation.toString(),
    data: event.data,
    blockHeight: header.number.toBn()
  };

  log.debug(`Received event at block ${header}:`, JSON.stringify(eventObj))

  const lastPostgresBlock = state.Postgres.lastBlock
  const lastElasticBlock = state.Elastic.lastBlock

  let processPostgres = false
  let processElastic = false
  
  if (lastPostgresBlock < lastElasticBlock) {
    // Process event only for Postgres
    processPostgres = true
  } else if (lastElasticBlock < lastPostgresBlock) {
    // Process event only for ElasticSearch
    processElastic = true
  } else {
    // Process event for both Postgres and ElasticSearch
    processPostgres = true
    processElastic = true
  }

  const eventData = { eventName: eventObj.method, data: eventObj.data, blockHeight: eventObj.blockHeight }
  
  const res = await DispatchForDb({ ...eventData, processPostgres, processElastic })

  log.info('Errors state: %o', res)
  log.info('Offchain state is: %o', state);

  if (res.PostgresError) {
    state.Postgres.lastError = res.PostgresError.stack
    log.error('An error occured in Postgres: %s', res.PostgresError)
  }

  if (res.ElasticError) {
    state.Elastic.lastError = res.ElasticError.stack
    log.error('An error occured in Elastic: %s', res.ElasticError)
  }
}

type CommonDbState = {
  lastBlock: number
  lastError?: string
}

type OffchainState = {
  Postgres: CommonDbState,
  Elastic: CommonDbState
}

const defaultOffchainState = (): OffchainState => ({
  Postgres: { lastBlock: 0 },
  Elastic: { lastBlock: 0 }
})

main().catch((error) => {
  log.error('Failed to subscribe to events', error);
  process.exit(-1);
});
