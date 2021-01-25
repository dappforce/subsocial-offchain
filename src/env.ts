export const TEST_MODE = process.env.TEST_MODE?.toLocaleLowerCase() === 'true'

export const offchainTWSPort = process.env.OFFCHAIN_TELEGRAM_WS_PORT

export const appsUrl = process.env.APP_BASE_URL

export const emailHost = process.env.EMAIL_HOST
export const emailPort = process.env.EMAIL_PORT
export const emailUser = process.env.EMAIL_USER
export const emailPassword = process.env.EMAIL_PASSWORD
export const port = process.env.OFFCHAIN_SERVER_PORT
