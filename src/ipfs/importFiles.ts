import { readdirSync, readFileSync } from 'fs'
import { backupPath, ipfsClusterUrl } from '../env'
import { entities } from './utils'
import { ipfsLog as log } from '../connections/loggers'
import request from 'request-promise'

const uploadFiles = async () => {
  for (const entity of entities) {
    const files = readdirSync(`${backupPath}/${entity}/files`)

    const filesPromise = files.map(async file => {
      const uploadImg = readFileSync(`${backupPath}/${entity}/files/${file}`)

      if (Buffer.isBuffer(uploadImg)) {
        const data = {
          value: uploadImg,
          options: { filename: file, contentType: '' }
        }

        try {
          await request(`${ipfsClusterUrl}/add`, { method: 'POST', formData: { '': data } })
          log.info('Content added and pinned under CID:', file)
        } catch (err) {
          log.error(file, err)
        }
      }
    })

    Promise.all(filesPromise)
  }
}

uploadFiles()