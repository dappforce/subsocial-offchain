export const TEST_MODE = process.env.TEST_MODE?.toLocaleLowerCase() === 'true'

export const offchainTWSPort = process.env.OFFCHAIN_TELEGRAM_WS_PORT

export const appsUrl = process.env.APP_BASE_URL

export const ipfsReadOnlyNodeUrl = process.env.IPFS_READ_ONLY_NODE_URL || 'http://localhost:8080'
export const ipfsNodeUrl = process.env.IPFS_NODE_URL || 'http://localhost:5001'
export const ipfsClusterUrl = process.env.IPFS_CLUSTER_URL || 'http://localhost:9094'
export const port = process.env.OFFCHAIN_SERVER_PORT || 3001

export const emailHost = process.env.EMAIL_HOST
export const emailPort = process.env.EMAIL_PORT
export const emailUser = process.env.EMAIL_USER
export const emailPassword = process.env.EMAIL_PASSWORD

export const recatchaKey = process.env.RECAPTCHA_KEY

export const subsocialLogo = `${ipfsNodeUrl}/ipfs/QmYnF6YpRvvXETzCmVVc3PBziig7sgra6QmtqKEoCngm2C`