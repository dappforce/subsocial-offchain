import { readFileSync, readdirSync  } from 'fs'
import { ipfsCluster } from '../connections/ipfs'
import request from 'request-promise'
import { backupPath, ipfsClusterUrl } from '../env'
import { ipfsLog as log } from '../connections/loggers'

const importIpfsData = async () => {
  const content = JSON.parse(readFileSync(`${backupPath}/content.json`, 'utf8'))
  try {
    for (const [_key, value] of Object.entries(content)) {
      await ipfsCluster.addContent(JSON.stringify(value))
    }

    const files = readdirSync(`${backupPath}/files`)

    for (const file of files) {
      const uploadImg = readFileSync(`${backupPath}/files/${file}`)
      if (Buffer.isBuffer(uploadImg)) {
        const data = {
          value: uploadImg,
          options: { filename: file, contentType: '' }
        }

        const res = await request(`${ipfsClusterUrl}/add`, { method: 'POST', formData: { '': data } })
        const body = JSON.parse(res)
        const cid = body.cid['/']
        log.debug('Content added and pinned under CID:', cid)
      }
    }

  } catch (err) {
    log.error(err)
  }
}

importIpfsData()