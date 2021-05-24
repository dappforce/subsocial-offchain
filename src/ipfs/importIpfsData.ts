import { readFileSync } from 'fs'
import { ipfsCluster } from '../connections/ipfs'
import { backupPath } from '../env'
import { ipfsLog as log } from '../connections/loggers'
import { CommonContent } from '@subsocial/types/offchain';
import { entities } from './utils';

const importIpfsData = async () => {
  for (const entity of entities) {
    const content: CommonContent = JSON.parse(readFileSync(`${backupPath}/${entity}/content.json`, 'utf8'))
    log.info(`Load ${entity} content`)
    for (const [key, value] of Object.entries(content)) {
      try {
        await ipfsCluster.addContent(JSON.stringify(value))
      } catch (err) {
        log.error(key, err)
      }
    }
  }
}

importIpfsData()