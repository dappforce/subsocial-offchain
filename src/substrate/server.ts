/* eslint-disable @typescript-eslint/no-misused-promises */
import { DispatchForDb } from './subscribe'
import { getEventSections, getEventMethods } from './utils';
import { Api } from '@subsocial/api/substrateConnect';
import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { substrateLog as log } from '../adaptors/loggers';

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
  substrate.api.query.system.events((events) => {
    events.forEach(async (record) => {
      // extract the event object
      const { event } = record;
      // check section filter
      if ((eventsFilterSections.includes(event.section.toString()) && eventsFilterMethods.includes(event.method.toString())) || eventsFilterSections.includes('all')) {
        // create event object for data sink
        const blockHash = await substrate.api.rpc.chain.getFinalizedHead();
        const header = await substrate.api.rpc.chain.getHeader(blockHash);

        const eventObj = {
          section: event.section,
          method: event.method,
          meta: event.meta.documentation.toString(),
          data: event.data,
          blockHeight: header.number.toBn()
        };

        log.debug('Event received:', JSON.stringify(eventObj))

        await DispatchForDb({ eventName: eventObj.method, data: eventObj.data, blockHeight: eventObj.blockHeight });
      }
    });
  });
}

main().catch((error) => {
  log.error('Failed to subscribe to events', error);
  process.exit(-1);
});
