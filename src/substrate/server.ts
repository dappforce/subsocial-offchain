/* eslint-disable @typescript-eslint/no-misused-promises */
import { DispatchForDb } from './subscribe'
import { getEventSections, getEventMethods } from './utils';
import { Api } from '@subsocial/api/substrateConnect';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { substrateLog as log } from '../connections/loggers';

export let substrate: SubsocialSubstrateApi;

require('dotenv').config();

// Register types before creating the API: registerCustomTypes();
// Create the API and wait until ready:
// code from https://polkadot.js.org/api/examples/rx/08_system_events/
async function main () {
  // get event filters from config
  const eventsFilterSections = getEventSections();
  const eventsFilterMethods = getEventMethods();
  log.debug(`Subscribe to events: ${eventsFilterMethods}`);
  // initialize the data service
  // internally connects to all storage sinks
  const api = await Api.connect(process.env.SUBSTRATE_URL)
  substrate = new SubsocialSubstrateApi(api);
  api.query.system.events((events) => {
    events.forEach(async (record) => {
      // extract the event object
      const { event } = record;
      // check section filter
  
      if ((eventsFilterSections.includes(event.section.toString()) && eventsFilterMethods.includes(event.method.toString())) || eventsFilterSections.includes('all')) {
        // create event object for data sink
        const blockHash = await api.rpc.chain.getFinalizedHead();
        const header = await api.rpc.chain.getHeader(blockHash);

        const eventObj = {
          section: event.section,
          method: event.method,
          meta: event.meta.documentation.toString(),
          data: event.data,
          blockHeight: header.number.toBn()
        };

        log.debug('Event received:', JSON.stringify(eventObj))

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
    });
  });
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
