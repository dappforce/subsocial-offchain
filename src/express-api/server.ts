import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors';
import parseSitePreview from '../parser/parse-preview'
import multer from 'multer';
import * as esReqHandlers from './handlers/esHandlers'
import * as ipfsReqHandlers from './handlers/ipfsHandlers'
import * as pgReqHandlers from './handlers/pgHandlers'
import * as faucetReqHandlers from './handlers/faucetHandlers'
import * as moderationsHandlers from './handlers/moderationHandlers'
import { expressApiLog as log } from '../connections/loggers';
import timeout from 'connect-timeout';
import { reqTimeoutSecs, maxFileSizeBytes, allowedOrigins } from './config';
import './email/jobs'
import { port } from '../env';
import { isEmptyStr } from '@subsocial/utils';

require('dotenv').config()

const app = express()

app.use(cors((req, callback) => {
  const origin = req.method === 'GET' ? '*' : allowedOrigins
  callback(null, { origin })
}))

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

app.post('/v1/ipfs/addFile', upload.single('file'), ipfsReqHandlers.addFile)

app.post('/v1/ipfs/add', ipfsReqHandlers.addContent)
app.get('/v1/ipfs/get', ipfsReqHandlers.getContentAsGetRequest)
app.post('/v1/ipfs/get', ipfsReqHandlers.getContentAsPostRequest)
app.delete('/v1/ipfs/pins/:cid', ipfsReqHandlers.deleteContent)

// API endpoints for querying search results from Elasticsearch engine

// TODO: get suggestions for search
app.get('/v1/offchain/search', esReqHandlers.searchHandler)

// API endpoints for personal user feed, notifications and all types of activities.

app.get('/v1/offchain/feed/:id', pgReqHandlers.feedHandler)
app.get('/v1/offchain/feed/:id/count', pgReqHandlers.feedCountHandler)

app.get('/v1/offchain/notifications/:id', pgReqHandlers.notificationsHandler)
app.get('/v1/offchain/notifications/:id/count', pgReqHandlers.notificationsCountHandler)

app.get('/v1/offchain/activities/:id', pgReqHandlers.activitiesHandler)
app.get('/v1/offchain/activities/:id/count', pgReqHandlers.activitiesCountHandler)

app.get('/v1/offchain/activities/:id/comments', pgReqHandlers.commentActivitiesHandler)
app.get('/v1/offchain/activities/:id/comments/count', pgReqHandlers.commentActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/posts', pgReqHandlers.postActivitiesHandler)
app.get('/v1/offchain/activities/:id/posts/count', pgReqHandlers.postActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/follows', pgReqHandlers.followActivitiesHandler)
app.get('/v1/offchain/activities/:id/follows/count', pgReqHandlers.followActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/reactions', pgReqHandlers.reactionActivitiesHandler)
app.get('/v1/offchain/activities/:id/reactions/count', pgReqHandlers.reactionActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/spaces', pgReqHandlers.spaceActivitiesHandler)
app.get('/v1/offchain/activities/:id/spaces/count', pgReqHandlers.spaceActivitiesCountHandler)

app.get('/v1/offchain/activities/:id/counts', pgReqHandlers.activityCountsHandler)


app.post('/v1/offchain/accounts/setSessionKey', pgReqHandlers.setSessionKeyHandler)

app.get('/v1/offchain/accounts/getSessionKey', pgReqHandlers.getSessionKeyHandler)

app.get('/v1/offchain/accounts/getNonce', pgReqHandlers.getNonceHandler)


app.post('/v1/offchain/telegram/setTelegramData', pgReqHandlers.setTelegramDataHandler)

app.post('/v1/offchain/telegram/setCurrentAccount', pgReqHandlers.setCurrentAccountHandler)

app.post('/v1/offchain/telegram/setLastPush', pgReqHandlers.setLastPushHandler)

app.get('/v1/offchain/telegram/getAccountByChatId/:chatId', pgReqHandlers.getAccountByChatIdHandler)

app.get('/v1/offchain/telegram/getTelegramChat', pgReqHandlers.getTelegramChatHandler)

app.post('/v1/offchain/telegram/updateTelegramChat', pgReqHandlers.updateTelegramChatHandler)


app.post('/v1/offchain/email/addEmailSettings', pgReqHandlers.addEmailSettingsHandler)

app.get('/v1/offchain/email/getEmailSettings', pgReqHandlers.getEmailSettingsHandler)

app.post('/v1/offchain/email/sendConfirmationLetter', pgReqHandlers.sendConfirmationLetterHandler)

app.post('/v1/offchain/email/setConfirmationDate', pgReqHandlers.confirmEmailForSettingsHandler)

app.get('/v1/offchain/stats/getStatisticData', pgReqHandlers.getStatisticDataHandler)

app.get('/v1/offchain/stats/getActivityCount', pgReqHandlers.getActivityCountByEventHandler)

app.get('/v1/offchain/stats/getActivityCountForToday', pgReqHandlers.getActivityCountForTodayHandler)


app.post('/v1/offchain/faucet/confirm', faucetReqHandlers.confirmEmailHandler)

app.post('/v1/offchain/faucet/drop', faucetReqHandlers.tokenDropHandler)

app.get('/v1/offchain/faucet/status', faucetReqHandlers.getFaucetStatus)

app.post('/v1/parseSite', async (req: express.Request, res: express.Response) => {
  const url = req.body.url

  if (isEmptyStr(url)) {
    res.status(400).send();
  }

  const data = await parseSitePreview(url)
  res.send(data);
})

export const startHttpServer = () => app.listen(port, () => {
  log.info(`HTTP server started on port ${port}`)
})

app.get('/v1/offchain/moderations/list', moderationsHandlers.getModerationHandler)