/* eslint-disable @typescript-eslint/no-misused-promises */
import { BlockNumber, Event, EventRecord, Hash } from '@polkadot/types/interfaces';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { Api, api } from '@subsocial/api/substrateConnect';
import { isDef, parseNumStr } from '@subsocial/utils';
import { readFile } from 'fs';
import { substrateLog as log } from '../connections/loggers';
import { DispatchForDb } from './subscribe';
import { defaultOffchainState, OffchainState } from './types';
import { eventsFilterMethods, eventsFilterSections } from './utils';
import { promisify } from 'util'

const asyncReadFile = promisify(readFile)

export let substrate: SubsocialSubstrateApi;

require('dotenv').config();

async function readOffchainState (): Promise<OffchainState> {
  const stateFilePath = `${__dirname}/../state.json`
  let state = defaultOffchainState()
  try {
    const json = await asyncReadFile(stateFilePath, 'utf8')
    state = JSON.parse(json) as OffchainState
  } catch (err) {
    log.error('Failed to read offchain state from file:', stateFilePath)
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

  const blockIndex = (isDef(lastBlock) && lastBlock >= 0
    ? lastBlock
    : parseNumStr(process.env.SUBSTRATE_START_FROM_BLOCK)
   ) || 0

  const blockNumber: BlockNumber = api.createType('BlockNumber', blockIndex)
  const blockHash: Hash = await api.rpc.chain.getBlockHash(blockNumber)
  log.info(`Block hash at height ${blockIndex}: ${blockHash}`)

  // TODO run in while () {
    const events = await api.query.system.events.at(blockHash)
    // Process all events of the current block
    for(const record of events) {
      await processEventRecord(record)
    }
    // TODO save this block height to state.json: { lastBlock: blockIndex }
    // TODO increment block: blockIndex++
  // } // end of while
}

function shouldProcessEvent (event: Event): boolean {
  return (
    eventsFilterSections.includes(event.section.toString()) && 
    eventsFilterMethods.includes(event.method.toString())
  ) || eventsFilterSections.includes('all')
}

async function processEventRecord (record: EventRecord) {
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

  await DispatchForDb({
    eventName: eventObj.method,
    data: eventObj.data,
    blockHeight: eventObj.blockHeight
  });
}

main().catch((error) => {
  log.error('Failed to subscribe to events', error);
  process.exit(-1);
});
