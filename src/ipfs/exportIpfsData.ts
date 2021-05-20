import { resolveSubsocialApi } from '../connections/subsocial'
import { mkdirSync, existsSync, writeFileSync } from 'fs'
import request from 'request-promise'
import { ipfsNodeUrl, ipfsReadOnlyNodeUrl, backupPath } from '../env';
import { CommonContent } from '@subsocial/types/offchain'
import { ipfsLog as log } from '../connections/loggers'
import { exit } from 'process';

const createDirIfNotExist = (path: string) => !existsSync(path) && mkdirSync(path)

const exportIpfsData = async () => {
  try {
    createDirIfNotExist(backupPath)

    const res = JSON.parse(await request(`${ipfsNodeUrl}/api/v0/pin/ls`, {method: "POST"}))
    const ipfsCids = Object.keys(res.Keys)

    const { ipfs } = await resolveSubsocialApi()

    const contents: Record<string, CommonContent> = {}

    createDirIfNotExist(`${backupPath}/files`)

    for (const  cid of ipfsCids) {
      if (cid.length === 46) {
        const uploadImg = await request(`${ipfsReadOnlyNodeUrl}/ipfs/${cid}`, { encoding: null })

        writeFileSync(`${backupPath}/files/${cid}`, uploadImg)
        log.debug(`Loaded file by cid ${cid}`)
      } else {
        const content = await ipfs.getContent(cid)
        contents[cid] = content
      }
    }

    writeFileSync(`${backupPath}/content.json`, JSON.stringify(contents, null, 2))
    exit(0)
  } catch (err) {
    log.error(err)
  }
}

exportIpfsData()