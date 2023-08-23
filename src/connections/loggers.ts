import { newLogger } from '@subsocial/utils'
require('dotenv').config();

export const expressApiLog = newLogger('Express API')
export const ipfsLog = newLogger('IPFS')
