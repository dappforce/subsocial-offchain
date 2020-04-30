import { Event, EventRecord, Hash, BlockNumber } from '@polkadot/types/interfaces';
import { substrateLog as log } from '../connections/loggers';
import { DispatchForDb } from './subscribe';
import { eventsFilterMethods, eventsFilterSections } from './utils';
import { OffchainState } from './types';

function shouldProcessEvent (event: Event): boolean {
  return (
    eventsFilterSections.includes(event.section.toString()) && 
    eventsFilterMethods.includes(event.method.toString())
  ) || eventsFilterSections.includes('all')
}

type EventContext = {
  event: EventRecord
  blockNumber: BlockNumber
  blockHash: Hash
  offchainState: OffchainState
}

export async function processEventRecord (ctx: EventContext) {
  const { event } = ctx.event;
  if (!shouldProcessEvent(event)) return;

  const { blockNumber: blockHeight, blockHash, offchainState: state } = ctx
  const eventData = { eventName: event.method, data: event.data, blockHeight }

  log.debug(`Process a new event at block #${blockHeight.toString()} (hash: ${blockHash.toHex()}): %o`, eventData)

  const lastPostgresBlock = state.Postgres.lastBlock
  const lastElasticBlock = state.Elastic.lastBlock

  let processPostgres = !state.Postgres.lastError
  let processElastic = !state.Elastic.lastError
  
  if (processPostgres && lastPostgresBlock > lastElasticBlock) {
    // Do not process event for Postgres
    processPostgres = false
  } else if (processElastic && lastElasticBlock > lastPostgresBlock) {
    // Do not process event for ElasticSearch
    processElastic = false
  }

  const res = await DispatchForDb({ ...eventData, processPostgres, processElastic })

  state.Postgres.lastError = res.PostgresError?.stack
  if (res.PostgresError) {
    log.error('An error occured in Postgres: %s', res.PostgresError)
  }

  state.Elastic.lastError = res.ElasticError?.stack
  if (res.ElasticError) {
    log.error('An error occured in Elastic: %s', res.ElasticError)
  }

  log.debug('Offchain state is: %o', state);
}
