import { ApiPromise, WsProvider } from '@polkadot/api';
import { DispatchForDb } from './subscribe'
import { getEventSections, getEventMethods } from './lib/utils';
import { registerDfTypes } from './../df-types';
import { Event, EventRecord, Header } from '@polkadot/types';

require("dotenv").config();

export class Api {

    protected api: ApiPromise

    public setup = async () => {
        await this.connectToApi();
        return this.api;
    }

    public destroy = () => {
        const { api } = this;
        if (api && api.isReady) {
        api.disconnect();
        console.log(`Disconnect from Substrate API.`);
        }
    }

    private connectToApi = async () => {
        const rpcEndpoint = `ws://${process.env.SUBSTRATE_URL}/`;
        const provider = new WsProvider(rpcEndpoint);

        // Register types before creating the API:
        registerDfTypes();

        // Create the API and wait until ready:
        console.log(`Connecting to Substrate API: ${rpcEndpoint}`)
        this.api = await ApiPromise.create(provider);

        // Retrieve the chain & node information information via rpc calls
        const system = this.api.rpc.system;

        const [ chain, nodeName, nodeVersion ] = await Promise.all(
        [ system.chain(), system.name(), system.version() ]);

        console.log(`Connected to chain '${chain}' (${nodeName} v${nodeVersion})`)
    }
}
let api: ApiPromise;

export { api };

// Register types before creating the API: registerCustomTypes();
// Create the API and wait until ready:
// code from https://polkadot.js.org/api/examples/rx/08_system_events/
async function main() {
    // get event filters from config
    const eventsFilterSections = getEventSections();
    const eventsFilterMethods = getEventMethods();
    console.log(eventsFilterMethods);
    // initialize the data service
    // internally connects to all storage sinks
    api = await new Api().setup();

    api.query.system.events(async (events: Event) => {
        events.forEach(async (record: EventRecord) => {
            // extract the event object
            const { event } = record;
            // check section filter
            if ( (eventsFilterSections.includes(event.section.toString()) && eventsFilterMethods.includes(event.method.toString())) || eventsFilterSections.includes("all")) {
                // create event object for data sink
                const hashBlock = await api.rpc.chain.getFinalizedHead();
                const header = await api.rpc.chain.getHeader(hashBlock) as Header;
                console.log(header.blockNumber);
        
                const eventObj = {
                    section: event.section,
                    method: event.method,
                    meta: event.meta.documentation.toString(),
                    data: event.data,
                    heightBlock: header.blockNumber
                };

                // remove this log if not needed
                console.log("Event Received: " + Date.now() + ": " + JSON.stringify(eventObj));

                await DispatchForDb({eventName: eventObj.method, data: eventObj.data, heightBlock: eventObj.heightBlock});
            }
        });
    });
};

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});