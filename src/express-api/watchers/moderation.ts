import { newLogger } from '@subsocial/utils';
import { watch, readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { asyncReadFile, stateDirPath } from '../../utils';
import emptyModerationList from './empty.json'

const CHANGE = 'change'
const blockListFilePath = join(stateDirPath, 'moderation.json')

const log = newLogger('Moderation watcher')

class ModerationApi {
  private data;

  constructor (data) { this.data = data }

  get blockList () {
    return this.data
  }

  set (data) {
    this.data = data
  }
}

const parseReadFile = (file: Buffer) => {
  try {
    return JSON.parse(file.toString())
  } catch (e) {
    log.error(e.stack)
  }
}

const startModerationWatcher = (): ModerationApi => {
  if (!existsSync(blockListFilePath)) {
    log.warn('Moderation file is not found')

    if (!existsSync(stateDirPath)) {
      mkdirSync(stateDirPath)
    }

    writeFileSync(blockListFilePath, JSON.stringify(emptyModerationList))
  }

  const moderationApi = new ModerationApi(parseReadFile(readFileSync(blockListFilePath)))

  log.info('Start watching')
  
  watch(blockListFilePath, async (type) => {
    if (type === CHANGE) {
  
      const buffer = await asyncReadFile(blockListFilePath)
  
      moderationApi.set(parseReadFile(buffer))
    }
  });

  return moderationApi
}

export const moderationApi = startModerationWatcher()
