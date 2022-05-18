import { substrateLog as log } from '../connections/loggers';
import { OffchainState } from './types';
import { join } from 'path'
import { asyncMkdir, asyncReadFile, asyncWriteFile, stateDirPath } from '../utils';

const stateFilePath = join(stateDirPath, 'state.json')

const defaultOffchainState = (): OffchainState => ({
  postgres: { lastBlock: 0 },
  elastic: { lastBlock: 0 },
  // time: new Date()
})

export async function readOffchainState (): Promise<OffchainState> {
  try {
    const json = await asyncReadFile(stateFilePath, 'utf8')
    const state = JSON.parse(json) as OffchainState
    // state.time = new Date(state.time)
    log.debug('Read the offchain state from FS: %o', state)
    return state
  } catch (err) {
    log.warn(`Could not read the offchain state from file: ${stateFilePath}`)
    return defaultOffchainState()
  }
}

export async function writeOffchainState (state: OffchainState) {
  log.debug('Write the offchain state to FS: %o', state)
  // state.time = new Date()
  const json = JSON.stringify(state)
  await asyncMkdir(stateDirPath, { recursive: true })
  return asyncWriteFile(stateFilePath, json, 'utf8')
}
