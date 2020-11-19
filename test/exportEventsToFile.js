
const { join } = require('path');
const { readFileSync, writeFileSync } = require('fs');
const { getUniqueIds } = require('@subsocial/api');
const { u32 } = require('@polkadot/types/primitive');
const { registry } = require('@subsocial/types/substrate/registry');
const { resolveSubsocialApi } = require('../build/src/connections/subsocial');
const { shouldHandleEvent } = require('../build/src/substrate/utils');
const { exit } = require('process');

const eventsJson = [] 

const getEventsStruct = async () => {
  const { substrate } = await resolveSubsocialApi()
  const api = await substrate.api

  const stateDirPath = join(__dirname, '../build/state/')

  const content = readFileSync(stateDirPath + 'Blocks.csv', 'utf-8')

  const blockNumbersArr = content.replace(/"/g, '').split('\n')
  const blockNumbers = getUniqueIds(blockNumbersArr)
    .map(x => new u32(registry, x))
    .sort((a, b) => a.sub(b).toNumber())
  
  await Promise.all(blockNumbers.map(async (blockNumber) => {
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber)
    let events = await api.query.system.events.at(blockHash)

    for (let i = 0; i < events.length; i++) {
      const { event } = events[i]

      if (shouldHandleEvent(event)) {
        const eventMeta = {
          eventName: event.method,
          data: event.data,
          blockNumber: blockNumber,
          eventIndex: i
        }
        eventsJson.push(eventMeta)
      }
    }
  }))


  writeFileSync('./test/input_data/events.json', JSON.stringify(eventsJson.sort((a, b) => a.blockNumber - b.blockNumber || a.eventIndex - b.eventIndex), null, 2))
}
getEventsStruct()