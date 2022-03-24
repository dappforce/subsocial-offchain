import { Router, Handler } from 'express'
import { ipfsCluster } from '../../connections'
import { getActualSchemaVersion } from '../../postgres/selects/getActualSchemaVersion'
import { readOffchainState } from '../../substrate/offchain-state'
import { queryElastic } from '../handlers/esHandlers'

const FIVE_MIN = 5 * 60 * 1000

const STATUS_READY = '/ready'
const STATUS_LIVE = '/live'

const buildSubscriberHealthRoute =
  (timeCheck: (time: Date) => boolean, entity: 'ready' | 'live'): Handler =>
  async (_, res) => {
    const { time } = await readOffchainState()
    if (time && timeCheck(time)) {
      res.send(`Subscriber is ${entity}`)
    } else {
      res.status(500).send(`Subscriber isn't ${entity}`)
    }
  }

const createIpfsHealthRoutes = () => {
  const router = Router()

  router.get(
    STATUS_LIVE,
    async (_req, res) => {
      const version = await ipfsCluster.testConnection()

      if (version) {
        res.send(`IPFS is ready. Version: ${version}`)
      } else {
        res.status(500).send(`IPFS isn't ready`)
      }
  })

  return router
}

const createElasticHealthRoutes = () => {
  const router = Router()

  router.get(
    STATUS_LIVE,
    async (_req, res) => {
      try {
        const searchResult = await queryElastic({ q: 'Subsocial', limit: 1, indexes: [ 'all' ]})

        if (searchResult) {
          res.send(`Elastic is live.`)
        } else {
         throw new Error()
        }
      } catch {
        res.status(500).send(`Elastic isn't ready`)
      }
  })

  return router
}

export const createPsqlHealthRoutes = () => {
  const router = Router()

  router.get(
    STATUS_LIVE,
    async (_req, res) => {
      const actualSchemaVersion = await getActualSchemaVersion()

      if (actualSchemaVersion !== undefined) {
        res.send(`Postgres is live`)
      } else {
        res.status(500).send(`Postgres isn't live`)
      }
  })

  return router
}

const createSubscriberHealthRoutes = () => {
  const router = Router()

  const startTime = new Date()

  router.get(
    STATUS_READY,
    buildSubscriberHealthRoute((time) => time > startTime, 'ready')
  )
  router.get(
    STATUS_LIVE,
    buildSubscriberHealthRoute((time) => new Date().getTime() - time.getTime() < FIVE_MIN, 'live')
  )

  return router
}

export const createHealthRoutes = () => {
  const router = Router()

  router.use('/subscriber', createSubscriberHealthRoutes())
  router.use('/ipfs', createIpfsHealthRoutes())
  router.use('/elastic', createElasticHealthRoutes())
  router.use('/postgres', createPsqlHealthRoutes())

  return router
}

export default createHealthRoutes

