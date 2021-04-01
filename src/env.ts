import { nonEmptyStr } from "@subsocial/utils"
import BN from "bn.js"

export const TEST_MODE = process.env.TEST_MODE?.toLocaleLowerCase() === 'true'

export const offchainTWSPort = process.env.OFFCHAIN_TELEGRAM_WS_PORT

export const appsUrl = process.env.APP_BASE_URL

export const ipfsReadOnlyNodeUrl = process.env.IPFS_READ_ONLY_NODE_URL || 'http://localhost:8080'
export const ipfsNodeUrl = process.env.IPFS_NODE_URL || 'http://localhost:5001'
export const ipfsClusterUrl = process.env.IPFS_CLUSTER_URL || 'http://localhost:9094'
export const port = process.env.OFFCHAIN_SERVER_PORT || 3001

export const emailHost = process.env.EMAIL_HOST
export const emailPort = parseInt(process.env.EMAIL_PORT)
export const emailUser = process.env.EMAIL_USER
export const emailPassword = process.env.EMAIL_PASSWORD
export const emailFrom = process.env.EMAIL_FROM

const _pause = process.env.PAUSE_BETWEEN_EMAILS_IN_MILLIS
export const PAUSE_BETWEEN_EMAILS_IN_MILLIS = nonEmptyStr(_pause) ? parseInt(_pause) : 1000

export const recatchaKey = process.env.RECAPTCHA_KEY

export const subsocialLogo = `https://app.subsocial.network/ipfs/ipfs/Qmasp4JHhQWPkEpXLHFhMAQieAH1wtfVRNHWZ5snhfFeBe`

export const faucetMnemonic = process.env.FAUCET_MNEMONIC

// TODO: replace '12' with a const from blockchain
export const faucetDripAmount = new BN(parseFloat(process.env.FAUCET_DRIP_AMOUNT || '0') * 10 ** 12)
