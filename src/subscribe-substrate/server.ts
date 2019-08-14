// Import the API and selected RxJs operators
import { ApiPromise, WsProvider } from '@polkadot/api';
import { DispatchForDb } from './adaptors/postgre'
import { getEventSections, getEventMethods } from './lib/utils';
import { registerJoystreamTypes } from '../df-types';
import { Event, EventRecord } from '@polkadot/types';

require("dotenv").config();

let api: ApiPromise;

export { api };

// Register types before creating the API: registerCustomTypes();
// Create the API and wait until ready:
// code from https://polkadot.js.org/api/examples/rx/08_system_events/
async function main() {
    // get event filters from config
    const eventsFilterSections = getEventSections();
    const eventsFilterMethods = getEventMethods();
    // initialize the data service
    // internally connects to all storage sinks
    const provider = new WsProvider();
    registerJoystreamTypes();
    // Create API with connection to the local Substrate node.
    // If your Substrate node is running elsewhere, add the config (server + port) in `.env`.
    // Use the config in the create function below.
    // If the Substrate runtime your are connecting to uses custom types,
    // please make sure that your have initialized the API object with them.
    // https://polkadot.js.org/api/api/#registering-custom-types
    api = await ApiPromise.create(provider);

    api.query.system.events(async (events: Event) => {
        events.forEach(async (record: EventRecord) => {
            // extract the event object
            const { event } = record;
            // check section filter
            if ( (eventsFilterSections.includes(event.section.toString()) && eventsFilterMethods.includes(event.method.toString())) || eventsFilterSections.includes("all")) {
                // create event object for data sink

                const eventObj = {
                    section: event.section,
                    method: event.method,
                    meta: event.meta.documentation.toString(),
                    data: event.data
                };

                // remove this log if not needed
                console.log("Event Received: " + Date.now() + ": " + JSON.stringify(eventObj));

                // insert in data sink
                // can have some error handling here
                // should not fail or catch exceptions gracefully
                // const log = await api.query.blogs.blogById(eventObj.data[1]);
                // console.log(log);
                await DispatchForDb({eventName: eventObj.method, data: eventObj.data});
            }
        });
    });
};

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});