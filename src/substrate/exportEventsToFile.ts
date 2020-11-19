import { resolveSubsocialApi } from '../connections/subsocial';
import { getBlockEventsFromSubstrate, getBlockNumbersFromFile } from './block-indexer';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { exit } from 'process';

const eventsJson = []

const getEventsStruct = async () => {
  const { substrate } = await resolveSubsocialApi()
  const api = await substrate.api

  const blockNumbers = getBlockNumbersFromFile()

  await Promise.all(blockNumbers.map(async (blockNumber) => {
    const blockEvents = await getBlockEventsFromSubstrate(api, blockNumber)
    blockEvents.map((event) =>  eventsJson.push(event))
  }))
  
  writeFileSync(join(__dirname, '../../../test/input_data/events.json'), JSON.stringify(eventsJson, null, 2))
  exit(0)
}

getEventsStruct()