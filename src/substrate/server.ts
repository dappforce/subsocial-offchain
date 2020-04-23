/* eslint-disable @typescript-eslint/no-misused-promises */
import { BlockNumber, Event, EventRecord, Hash } from '@polkadot/types/interfaces';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { Api } from '@subsocial/api/substrateConnect';
import { ApiPromise } from '@polkadot/api'
import { isDef, parseNumStr } from '@subsocial/utils';
import { readFile, writeFile } from 'fs';
import { substrateLog as log } from '../connections/loggers';
import { DispatchForDb } from './subscribe';
import { defaultOffchainState, OffchainState } from './types';
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

  const { lastBlock } = await readOffchainState()
  const slotDuration = api.consts.timestamp?.minimumPeriod.muln(2).toNumber();

  let blockIndex = (isDef(lastBlock) && lastBlock >= 0
    ? lastBlock
    : parseNumStr(process.env.SUBSTRATE_START_FROM_BLOCK)
  ) || 0

  let lastKnownBestFinalized = (
    await api.derive.chain.bestNumberFinalized()
  ).toNumber()

  while (true) {
    if (blockIndex > lastKnownBestFinalized) {
      log.debug('Waiting for finalization.')

      const bestFinalizedBlock = (await api.derive.chain.bestNumberFinalized()).toNumber();
      lastKnownBestFinalized = bestFinalizedBlock;

      await new Promise(r => setTimeout(r, slotDuration));
      continue;
    }

    log.debug(`Block index: ${blockIndex}`)
    log.debug(`Last known best finalized: ${lastKnownBestFinalized}`)
    const blockNumber: BlockNumber = api.createType('BlockNumber', blockIndex)
    const blockHash: Hash = await api.rpc.chain.getBlockHash(blockNumber)
    log.debug(`Block hash: ${blockHash}`)

    const events = await api.query.system.events.at(blockHash)
    // Process all events of the current block
    for(const record of events) {
      await processEventRecord(api, record)
    }

    blockIndex += 1;
    const json = JSON.stringify({
      lastBlock: blockIndex
    } as OffchainState);
    await asyncWriteFile(stateFilePath, json, 'utf8');
  }
}

function shouldProcessEvent (event: Event): boolean {
  return (
    eventsFilterSections.includes(event.section.toString()) && 
    eventsFilterMethods.includes(event.method.toString())
  ) || eventsFilterSections.includes('all')
}

async function processEventRecord (api: ApiPromise, record: EventRecord) {
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

        // TODO get real state from file here:
        const state: OffchainState = {} as OffchainState

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
        // TODO get HandlerResult here and update corresponding state in state.json file 
        // for both Postgres and Elastic
        
        if (res.PostgresError) {
          // TODO stop processing postgres
        }

        if (res.ElasticError) {
          // TODO stop processing Elastic
        }
}

type CommonDbState = {
  lastBlock?: number
  lastError?: string
}

type OffchainState = {
  Postgres: CommonDbState,
  Elastic: CommonDbState
}

main().catch((error) => {
  log.error('Failed to subscribe to events', error);
  process.exit(-1);
});
