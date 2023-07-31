import { Handler, Router } from 'express'
import {ipfsApi} from "../../ipfs";

const STATUS_READY = '/readiness'
const STATUS_LIVE = '/liveness'

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
  const upCID = await ipfsApi.saveAndPinJson({ ipfs: 'UP' })

  return buildCheckResponse(!!upCID, { upCID })
}

const buildCheckOffchain = async () => {
  const responses = await Promise.all([
    checkIpfs(),
  ])

  const isHealth = responses.every((res) => res.status === 'UP')

  const [ipfs] = responses

  return buildCheckResponse(isHealth, { ipfs })
}


const liveCheck = () => buildCheckOffchain()
const readyCheck = () => buildCheckOffchain()
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
