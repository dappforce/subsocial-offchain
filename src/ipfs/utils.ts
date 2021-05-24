import { existsSync, mkdirSync, writeFileSync } from 'fs';
import request from 'request-promise'
import { /* backupPath, */ ipfsReadOnlyNodeUrl } from '../env'
import { ipfsLog as log } from '../connections/loggers'

export const entities = ['posts', 'spaces', 'profiles']

export const createDirsIfNotExist = (path: string[]) => path.map(path => !existsSync(path) && mkdirSync(path))

export const downloadFile = async (path: string, cid: string) => {
  if(cid && cid.length === 46) {
    try {
      const uploadImg = await request(`${ipfsReadOnlyNodeUrl}/ipfs/${cid}`, { encoding: null })
      writeFileSync(`${path}/files/${cid}`, uploadImg)
    } catch (err) {
      log.error(err)
    }
  }
}