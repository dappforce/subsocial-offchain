import { Router } from 'express'
import express from 'express'
import parseSitePreview from '../parser/parse-preview'
import multer from 'multer'
import * as esReqHandlers from './handlers/esHandlers'
import * as ipfsReqHandlers from './handlers/ipfsHandlers'
import * as pgReqHandlers from './handlers/pgHandlers'
import * as emailHandlers from './handlers/emailHandlers'
import * as moderationHandlers from './handlers/getBlockListHandler'
import { maxFileSizeBytes } from './config'
import './email/jobs'
import { isEmptyStr } from '@subsocial/utils'
import { checkSignature } from './utils'

const upload = multer({ limits: { fieldSize: maxFileSizeBytes } })
// Uncomment the next line to add support for multi-file upload:
// app.use(upload.array())

const getV1 = (url: string) => `/v1/${url}`
const getV1Offchain = (url: string) => getV1(`offchain${url}`)
const getV1Ipfs = (url: string) => getV1(`ipfs${url}`)

export const createRoutes = () => {
  const router = Router()

  // IPFS API

  router.post(getV1Ipfs('/addFile'), upload.single('file'), ipfsReqHandlers.addFile)

  router.post(getV1Ipfs('/add'), ipfsReqHandlers.addContent)
  router.get(getV1Ipfs('/get'), ipfsReqHandlers.getContentAsGetRequest)
  router.post(getV1Ipfs('/get'), ipfsReqHandlers.getContentAsPostRequest)
  router.delete(getV1Ipfs('/pins/:cid'), ipfsReqHandlers.deleteContent)

  // API endpoints for querying search results from Elasticsearch engine

  // TODO: get suggestions for search
  router.get(getV1Offchain('/search'), esReqHandlers.searchHandler)

  // API endpoints for personal user feed, notifications and all types of activities.

  router.get(getV1Offchain('/feed/:account'), pgReqHandlers.feedHandler)
  router.get(getV1Offchain('/feed/:account/count'), pgReqHandlers.feedCountHandler)

  router.get(getV1Offchain('/notifications/:account'), pgReqHandlers.notificationsHandler)
  router.get(
    getV1Offchain('/notifications/:account/count'),
    pgReqHandlers.notificationsCountHandler
  )

  router.get(getV1Offchain('/activities/:account'), pgReqHandlers.activitiesHandler)
  router.get(getV1Offchain('/activities/:account/count'), pgReqHandlers.activitiesCountHandler)
  router.get(getV1Offchain('/activities/:account/comments'), pgReqHandlers.commentActivitiesHandler)
  router.get(
    getV1Offchain('/activities/:account/comments/count'),
    pgReqHandlers.commentActivitiesCountHandler
  )
  router.get(getV1Offchain('/activities/:account/posts'), pgReqHandlers.postActivitiesHandler)
  router.get(
    getV1Offchain('/activities/:account/posts/count'),
    pgReqHandlers.postActivitiesCountHandler
  )
  router.get(getV1Offchain('/activities/:account/follows'), pgReqHandlers.followActivitiesHandler)
  router.get(
    getV1Offchain('/activities/:account/follows/count'),
    pgReqHandlers.followActivitiesCountHandler
  )
  router.get(
    getV1Offchain('/activities/:account/reactions'),
    pgReqHandlers.reactionActivitiesHandler
  )
  router.get(
    getV1Offchain('/activities/:account/reactions/count'),
    pgReqHandlers.reactionActivitiesCountHandler
  )

  router.get(getV1Offchain('/activities/:account/spaces'), pgReqHandlers.spaceActivitiesHandler)
  router.get(
    getV1Offchain('/activities/:account/spaces/count'),
    pgReqHandlers.spaceActivitiesCountHandler
  )

  router.get(getV1Offchain('/activities/:account/counts'), pgReqHandlers.activityCountsHandler)

  router.post(getV1Offchain('/accounts/setSessionKey'), pgReqHandlers.setSessionKeyHandler)
  router.get(getV1Offchain('/accounts/getSessionKey'), pgReqHandlers.getSessionKeyHandler)
  router.get(getV1Offchain('/accounts/getNonce'), pgReqHandlers.getNonceHandler)

  router.post(getV1Offchain('/telegram/setTelegramData'), pgReqHandlers.setTelegramDataHandler)
  router.post(getV1Offchain('/telegram/setCurrentAccount'), pgReqHandlers.setCurrentAccountHandler)
  router.post(getV1Offchain('/telegram/setLastPush'), pgReqHandlers.setLastPushHandler)
  router.get(
    getV1Offchain('/telegram/getAccountByChatId/:chatId'),
    pgReqHandlers.getAccountByChatIdHandler
  )
  router.get(getV1Offchain('/telegram/getTelegramChat'), pgReqHandlers.getTelegramChatHandler)
  router.post(
    getV1Offchain('/telegram/updateTelegramChat'),
    pgReqHandlers.updateTelegramChatHandler
  )

  router.post(getV1Offchain('/email/addEmailSettings'), pgReqHandlers.addEmailSettingsHandler)
  router.get(getV1Offchain('/email/getEmailSettings'), pgReqHandlers.getEmailSettingsHandler)
  router.post(
    getV1Offchain('/email/sendConfirmationLetter'),
    pgReqHandlers.sendConfirmationLetterHandler
  )
  router.post(
    getV1Offchain('/email/setConfirmationDate'),
    pgReqHandlers.confirmEmailForSettingsHandler
  )
  router.post(getV1Offchain('/email/confirm'), emailHandlers.confirmEmailHandler)

  router.get(getV1Offchain('/stats/getStatisticData'), pgReqHandlers.getStatisticDataHandler)
  router.get(getV1Offchain('/stats/getActivityCount'), pgReqHandlers.getActivityCountByEventHandler)
  router.get(
    getV1Offchain('/stats/getActivityCountForToday'),
    pgReqHandlers.getActivityCountForTodayHandler
  )

  // router.post(getV1Offchain('/faucet/confirm'), faucetReqHandlers.confirmEmailHandler)
  // router.post(getV1Offchain('/faucet/drop'), faucetReqHandlers.tokenDropHandler)
  // router.get(getV1Offchain('/faucet/status'), faucetReqHandlers.getFaucetStatus)

  router.post(
    getV1Offchain('/contributions/add'),
    checkSignature,
    pgReqHandlers.addContributionHandler
  )
  router.get(getV1Offchain('/contributions/:refCode'), pgReqHandlers.getContributionsByRefIdHandler)

  router.post(getV1Offchain('/parseSite'), async (req: express.Request, res: express.Response) => {
    const url = req.body.url

    if (isEmptyStr(url)) {
      res.status(400).send()
    }

    const data = await parseSitePreview(url)
    res.send(data)
  })

  router.get(getV1Offchain('/moderation/list'), moderationHandlers.getBlockListHandler)

  return router
}
