export const TEST_MODE = process.env.TEST_MODE?.toLocaleLowerCase() === 'true'

export const offchainTWSPort = process.env.OFFCHAIN_TELEGRAM_WS_PORT