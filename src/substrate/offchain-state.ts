import { substrateLog as log } from '../connections/loggers';
import { OffchainState } from './types';
import { readFile, writeFile } from 'fs';
import { promisify } from 'util'

const asyncReadFile = promisify(readFile)
const asyncWriteFile = promisify(writeFile)
const stateFilePath = `${__dirname}/../state.json`

const defaultOffchainState = (): OffchainState => ({
  postgres: { lastBlock: 0 },
  elastic: { lastBlock: 0 }
})

export async function readOffchainState (): Promise<OffchainState> {
  try {
    const json = await asyncReadFile(stateFilePath, 'utf8')
    const state = JSON.parse(json) as OffchainState
    log.debug('Read the offchain state from FS: %o', state)
    return state
  } catch (err) {
    log.warn(`Could not read the offchain state from file: ${stateFilePath}`)
    return defaultOffchainState()
  }
}

export async function writeOffchainState (state: OffchainState) {
  log.debug('Write the offchain state to FS: %o', state)
  const json = JSON.stringify(state)
  return asyncWriteFile(stateFilePath, json, 'utf8')
}
