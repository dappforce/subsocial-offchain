import { readdirSync, readFileSync } from 'fs'
import { backupPath } from '../env'
import { entities } from './utils'
import { ipfsCluster } from '../connections/ipfs';

const importFiles = async () => {
  for (const entity of entities) {
    let files = readdirSync(`${backupPath}/${entity}/files`)

    for (const file of files) {
      let uploadImg = readFileSync(`${backupPath}/${entity}/files/${file}`)

      if (Buffer.isBuffer(uploadImg)) {
        const fileData = {
          buffer: uploadImg,
          originalname: file,
          mimetype: ''
        } as any

        await ipfsCluster.addFile(fileData)
      }
      uploadImg = null
    }
    files = null
  }
}

importFiles()