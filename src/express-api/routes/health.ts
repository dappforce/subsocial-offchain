import { Router, Handler } from 'express'
import { readOffchainState } from '../../substrate/offchain-state'

const FIVE_MIN = 5 * 60 * 1000

const buildHealthRoute =
  (timeCheck: (time: Date) => boolean, entity: 'ready' | 'live'): Handler =>
  async (_, res) => {
    const { time } = await readOffchainState()
    if (time && timeCheck(time)) {
      res.send(`Subscriber is ${entity}`)
    } else {
      res.status(500).send(`Subscriber isn't ${entity}`)
    }
  }

export const createHealthRoutes = () => {
  const router = Router()

  const startTime = new Date()

  router.get(
    '/ready',
    buildHealthRoute((time) => time > startTime, 'ready')
  )
  router.get(
    '/live',
    buildHealthRoute((time) => new Date().getTime() - time.getTime() < FIVE_MIN, 'live')
  )

  return router
}

export default createHealthRoutes
