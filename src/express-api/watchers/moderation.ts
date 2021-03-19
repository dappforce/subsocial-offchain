import { newLogger } from '@subsocial/utils';
import { watch, readFileSync } from 'fs';
import { join } from 'path';
import { asyncReadFile, stateDirPath } from '../../utils';

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

export const moderationApi = new ModerationApi(parseReadFile(readFileSync(blockListFilePath)))

log.info('Start watching')

watch(blockListFilePath, async (type) => {
  if (type === CHANGE) {

    const buffer = await asyncReadFile(blockListFilePath)

    moderationApi.set(parseReadFile(buffer))
  }
});