
import { substrateLog as log } from '../connections/loggers';
import { OffchainState } from './types';
import { readFile, writeFile } from 'fs';
import { promisify } from 'util'

const asyncReadFile = promisify(readFile)
const asyncWriteFile = promisify(writeFile)
const stateFilePath = `${__dirname}/../state.json`

const defaultOffchainState = (): OffchainState => ({
  Postgres: { lastBlock: 0 },
  Elastic: { lastBlock: 0 }
})

export async function readOffchainState (): Promise<OffchainState> {
  let state = defaultOffchainState()
  try {
    const json = await asyncReadFile(stateFilePath, 'utf8')
    state = JSON.parse(json) as OffchainState
  } catch (err) {
    log.error(`Failed to read offchain state from file: ${stateFilePath}`)
  }
  return state
}

export async function writeOffchainState (offchainState: OffchainState) {
  const json = JSON.stringify(offchainState)
  return asyncWriteFile(stateFilePath, json, 'utf8')
}
