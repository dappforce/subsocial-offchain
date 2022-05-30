import axios from 'axios'
import { Handler, Router } from 'express'
import { ipfsCluster } from '../../connections'
import { esNodeUrl } from '../../env'
import { getActualSchemaVersion } from '../../postgres/selects/getActualSchemaVersion'
import { readOffchainState } from '../../substrate/offchain-state'

const FIVE_MIN = 5 * 60 * 1000

const STATUS_READY = '/readiness'
const STATUS_LIVE = '/liveness'

const buildSubscriberHealthRoute =
  (timeCheck: (time: Date) => boolean): CheckFn =>
  async () => {
    const { time } = await readOffchainState()
    return buildCheckResponse(time && timeCheck(time))
  }

type Status = 'UP' | 'DOWN'

type CheckResponse = {
  status: Status
  [key: string]: any
}

type CheckFn = (...args: any[]) => Promise<CheckResponse>

const getStatus = (isUp: boolean) => (isUp ? 'UP' : 'DOWN')
const buildCheckResponse = (isUp: boolean, details?: Record<string, any>): CheckResponse => ({
  status: getStatus(isUp),
  details
})

const checkIpfs: CheckFn = async () => {
  const version = await ipfsCluster.testConnection()

  return buildCheckResponse(!!version, { version })
}

const checkElastic: CheckFn = async () => {
  try {
    const { data, status } = await axios.get(`${esNodeUrl}/_cluster/health`)

    return buildCheckResponse(status === 200 && data?.status !== 'red')
  } catch {
    return buildCheckResponse(false)
  }
}

const checkPostgres: CheckFn = async () => {
  try {
    const actualSchemaVersion = await getActualSchemaVersion()

    return buildCheckResponse(!!actualSchemaVersion, { actualSchemaVersion })
  } catch {
    return buildCheckResponse(false)
  }
}

const buildCheckOffchain = async (_checkSubscriber: CheckFn) => {
  const responses = await Promise.all([
    checkIpfs(),
    checkElastic(),
    checkPostgres(),
    // TODO: enable when will fix it
    // checkSubscriber()
  ])

  const isHealth = responses.every((res) => res.status === 'UP')

  const [ipfs, elastic, postgres, /* subscriber */] = responses

  return buildCheckResponse(isHealth, { ipfs, elastic, postgres, /* subscriber */ })
}

const startTime = new Date()
const checkLiveForSubscriber: CheckFn = buildSubscriberHealthRoute((time) => time > startTime)
const checkReadyForSubscriber: CheckFn = buildSubscriberHealthRoute(
  (time) => new Date().getTime() - time.getTime() < FIVE_MIN)

const liveCheck = () => buildCheckOffchain(checkLiveForSubscriber)
const readyCheck = () => buildCheckOffchain(checkReadyForSubscriber)
const checkHealth = async () => {
  const responses = await Promise.all([readyCheck(), liveCheck()])

  const isHealth = responses.every((res) => res.status === 'UP')

  const [readiness, liveness] = responses

  return buildCheckResponse(isHealth, { readiness, liveness })
}

const buildCheckHeader =
  (check: CheckFn): Handler =>
  async (_, res) => {
    const response = await check()

    if (response.status === 'UP') {
      res.json(response)
    } else {
      res.status(500).json(response)
    }
  }

export const createHealthRoutes = () => {
  const router = Router()

  router.get('/', buildCheckHeader(checkHealth))
  router.get(STATUS_READY, buildCheckHeader(readyCheck))
  router.get(STATUS_LIVE, buildCheckHeader(liveCheck))

  return router
}

export default createHealthRoutes
