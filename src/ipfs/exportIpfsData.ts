import { resolveSubsocialApi } from '../connections/subsocial'
import { writeFileSync } from 'fs'
import request from 'request-promise'
import { ipfsNodeUrl, backupPath } from '../env';
import { CommonContent } from '@subsocial/types/offchain'
import { ipfsLog as log } from '../connections/loggers'
import { exit } from 'process';
import { createDirsIfNotExist, downloadFile } from './utils';

const exportIpfsData = async () => {
  try {
    createDirsIfNotExist([backupPath, `${backupPath}/files`])

    const res = JSON.parse(await request(`${ipfsNodeUrl}/api/v0/pin/ls`, {method: "POST"}))
    const ipfsCids = Object.keys(res.Keys)

    const { ipfs } = await resolveSubsocialApi()

    const contents: Record<string, CommonContent> = {}

    for (const  cid of ipfsCids) {
      if (cid.length === 46) {
        await downloadFile(backupPath, cid)

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