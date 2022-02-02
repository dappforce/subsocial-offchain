import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import parseSitePreview from '../parser/parse-preview'
import multer from 'multer'
import * as esReqHandlers from './handlers/esHandlers'
import * as ipfsReqHandlers from './handlers/ipfsHandlers'
import * as pgReqHandlers from './handlers/pgHandlers'
import * as emailHandlers from './handlers/emailHandlers'
import * as pollsHandlers from './handlers/votesHandlers'
import * as moderationHandlers from './handlers/getBlockListHandler'
import { expressApiLog as log } from '../connections/loggers'
import timeout from 'connect-timeout'
import { reqTimeoutSecs, maxFileSizeBytes } from './config'
import './email/jobs'
import {corsAllowedList, isAllCorsAllowed, port} from '../env'
import { isEmptyStr } from '@subsocial/utils'
import {checkSessionKeySignature, checkRegularSignature} from './utils'

require('dotenv').config()

const app = express()

const corsOpts = function (req: express.Request, callback) {
  const corsOptions = { origin: false }

  if (
    isAllCorsAllowed ||
    req.method === 'GET' ||
    corsAllowedList.indexOf(req.header('Origin')) !== -1
  ) {
    corsOptions.origin = true // reflect (enable) the requested origin in the CORS response
  }

  callback(null, corsOptions) // callback expects two parameters: error and options
}

app.use(cors(corsOpts))

function haltOnTimedout(req: express.Request, _res: express.Response, next) {
  if (!req.timedout) next()
}

app.use(timeout(`${reqTimeoutSecs}s`))

// for parsing application/json
app.use(bodyParser.json({ limit: maxFileSizeBytes }))
app.use(haltOnTimedout)

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: maxFileSizeBytes }))
app.use(haltOnTimedout)

// for parsing multipart/form-data
const upload = multer({ limits: { fieldSize: maxFileSizeBytes } })
app.use(express.static('./email/templates'))

// IPFS API

// Uncomment the next line to add support for multi-file upload:
// app.use(upload.array())

const getV1 = (url: string) => `/v1/${url}`
const getV1Offchain = (url: string) => getV1(`offchain${url}`)
const getV1Ipfs = (url: string) => getV1(`ipfs${url}`)

app.post(getV1Ipfs('/addFile'), upload.single('file'), ipfsReqHandlers.addFile)

app.post(getV1Ipfs('/add'), ipfsReqHandlers.addContent)
app.get(getV1Ipfs('/get'), ipfsReqHandlers.getContentAsGetRequest)
app.post(getV1Ipfs('/get'), ipfsReqHandlers.getContentAsPostRequest)
app.delete(getV1Ipfs('/pins/:cid'), ipfsReqHandlers.deleteContent)

// API endpoints for querying search results from Elasticsearch engine

// TODO: get suggestions for search
app.get(getV1Offchain('/search'), esReqHandlers.searchHandler)

// API endpoints for personal user feed, notifications and all types of activities.

app.get(getV1Offchain('/feed/:account'), pgReqHandlers.feedHandler)
app.get(getV1Offchain('/feed/:account/count'), pgReqHandlers.feedCountHandler)

app.get(getV1Offchain('/notifications/:account'), pgReqHandlers.notificationsHandler)
app.get(getV1Offchain('/notifications/:account/count'), pgReqHandlers.notificationsCountHandler)

app.get(getV1Offchain('/activities/:account'), pgReqHandlers.activitiesHandler)
app.get(getV1Offchain('/activities/:account/count'), pgReqHandlers.activitiesCountHandler)
app.get(getV1Offchain('/activities/:account/comments'), pgReqHandlers.commentActivitiesHandler)
app.get(getV1Offchain('/activities/:account/comments/count'),
  pgReqHandlers.commentActivitiesCountHandler
)
app.get(getV1Offchain('/activities/:account/posts'), pgReqHandlers.postActivitiesHandler)
app.get(getV1Offchain('/activities/:account/posts/count'), pgReqHandlers.postActivitiesCountHandler)
app.get(getV1Offchain('/activities/:account/follows'), pgReqHandlers.followActivitiesHandler)
app.get(
    getV1Offchain('/activities/:account/follows/count'),
  pgReqHandlers.followActivitiesCountHandler
)
app.get(getV1Offchain('/activities/:account/reactions'), pgReqHandlers.reactionActivitiesHandler)
app.get(
    getV1Offchain('/activities/:account/reactions/count'),
  pgReqHandlers.reactionActivitiesCountHandler
)

app.get(getV1Offchain('/activities/:account/spaces'), pgReqHandlers.spaceActivitiesHandler)
app.get(getV1Offchain('/activities/:account/spaces/count'), pgReqHandlers.spaceActivitiesCountHandler)

app.get(getV1Offchain('/activities/:account/counts'), pgReqHandlers.activityCountsHandler)

app.post(getV1Offchain('/accounts/setSessionKey'), pgReqHandlers.setSessionKeyHandler)
app.get(getV1Offchain('/accounts/getSessionKey'), pgReqHandlers.getSessionKeyHandler)
app.get(getV1Offchain('/accounts/getNonce'), pgReqHandlers.getNonceHandler)

app.post(getV1Offchain('/telegram/setTelegramData'), pgReqHandlers.setTelegramDataHandler)
app.post(getV1Offchain('/telegram/setCurrentAccount'), pgReqHandlers.setCurrentAccountHandler)
app.post(getV1Offchain('/telegram/setLastPush'), pgReqHandlers.setLastPushHandler)
app.get(getV1Offchain('/telegram/getAccountByChatId/:chatId'), pgReqHandlers.getAccountByChatIdHandler)
app.get(getV1Offchain('/telegram/getTelegramChat'), pgReqHandlers.getTelegramChatHandler)
app.post(getV1Offchain('/telegram/updateTelegramChat'), pgReqHandlers.updateTelegramChatHandler)

app.post(getV1Offchain('/email/addEmailSettings'), pgReqHandlers.addEmailSettingsHandler)
app.get(getV1Offchain('/email/getEmailSettings'), pgReqHandlers.getEmailSettingsHandler)
app.post(getV1Offchain('/email/sendConfirmationLetter'), pgReqHandlers.sendConfirmationLetterHandler)
app.post(getV1Offchain('/email/setConfirmationDate'), pgReqHandlers.confirmEmailForSettingsHandler)
app.post(getV1Offchain('/email/confirm'), emailHandlers.confirmEmailHandler)

app.get(getV1Offchain('/stats/getStatisticData'), pgReqHandlers.getStatisticDataHandler)
app.get(getV1Offchain('/stats/getActivityCount'), pgReqHandlers.getActivityCountByEventHandler)
app.get(
    getV1Offchain('/stats/getActivityCountForToday'),
  pgReqHandlers.getActivityCountForTodayHandler
)

// app.post(getV1Offchain('/faucet/confirm'), faucetReqHandlers.confirmEmailHandler)
// app.post(getV1Offchain('/faucet/drop'), faucetReqHandlers.tokenDropHandler)
// app.get(getV1Offchain('/faucet/status'), faucetReqHandlers.getFaucetStatus)

app.post(getV1Offchain('/contributions/add'), checkSessionKeySignature, pgReqHandlers.addContributionHandler)
app.get(getV1Offchain('/contributions/:refCode'), pgReqHandlers.getContributionsByRefIdHandler)

app.post(getV1Offchain('/parseSite'), async (req: express.Request, res: express.Response) => {
  const url = req.body.url

  if (isEmptyStr(url)) {
    res.status(400).send()
  }

  const data = await parseSitePreview(url)
  res.send(data)
})

app.get(getV1Offchain('/polls/:pollId/votes'), pollsHandlers.getVoteByPollHandler)
app.get(getV1Offchain('/polls/:pollId/:account/vote'), pollsHandlers.getVoteByAccountAndPollHandler)
app.get(getV1Offchain('/polls/snapshot/:account'), pollsHandlers.accountFromSnapshotHandler)
app.post(getV1Offchain('/polls/upsert'), checkRegularSignature, pollsHandlers.upsertVoteHandler)
app.get(getV1Offchain('/moderation/list'), moderationHandlers.getBlockListHandler)



export const startHttpServer = () =>
  app.listen(port, async () => {
    log.info(`HTTP server started on port ${port}`)
  })
