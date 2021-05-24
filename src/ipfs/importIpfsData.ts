import { readFileSync } from 'fs'
import { ipfsCluster } from '../connections/ipfs'
import { backupPath } from '../env'
import { ipfsLog as log } from '../connections/loggers'
import { entities } from './utils';

const importContents = async () => {
  for (const entity of entities) {
    let contents = Object.entries(JSON.parse(readFileSync(`${backupPath}/${entity}/content.json`, 'utf8')))
    log.info(`Load ${entity} content`)
    for (const [key, value] of contents) {
      try {
        await ipfsCluster.addContent(JSON.stringify(value))
      } catch (err) {
        log.error(key, err)
      }
    }
    contents = null
  }
}

importContents()