import { Router } from 'express'
import * as esReqHandlers from '../../handlers/esHandlers'
import * as pgReqHandlers from '../../handlers/pgHandlers'
import * as emailHandlers from '../../handlers/emailHandlers'
import * as moderationHandlers from '../../handlers/getBlockListHandler'
import * as votesHandlers from '../../handlers/votesHandlers'
import * as tokensaleHandlers from '../../handlers/tokensaleHandlers/'
import { checkRegularSignature, checkSessionKeySignature } from '../../utils'

export const createOffchainRoutes = () => {
  const router = Router()
  // API endpoints for querying search results from Elasticsearch engine
  // TODO: get suggestions for search
  router.get('/search', esReqHandlers.searchHandler)

  // API endpoints for personal user feed, notifications and all types of activities.

  router.get('/feed/:account', pgReqHandlers.feedHandler)
  router.get('/feed/:account/count', pgReqHandlers.feedCountHandler)

  router.get('/notifications/:account', pgReqHandlers.notificationsHandler)
  router.get(
    '/notifications/:account/count',
    pgReqHandlers.notificationsCountHandler
  )

  router.get('/activities/:account', pgReqHandlers.activitiesHandler)
  router.get('/activities/:account/count', pgReqHandlers.activitiesCountHandler)
  router.get('/activities/:account/comments', pgReqHandlers.commentActivitiesHandler)
  router.get(
    '/activities/:account/comments/count',
    pgReqHandlers.commentActivitiesCountHandler
  )
  router.get('/activities/:account/posts', pgReqHandlers.postActivitiesHandler)
  router.get(
    '/activities/:account/posts/count',
    pgReqHandlers.postActivitiesCountHandler
  )
  router.get('/activities/:account/follows', pgReqHandlers.followActivitiesHandler)
  router.get(
    '/activities/:account/follows/count',
    pgReqHandlers.followActivitiesCountHandler
  )
  router.get(
    '/activities/:account/reactions',
    pgReqHandlers.reactionActivitiesHandler
  )
  router.get(
    '/activities/:account/reactions/count',
    pgReqHandlers.reactionActivitiesCountHandler
  )

  router.get('/activities/:account/spaces', pgReqHandlers.spaceActivitiesHandler)
  router.get(
    '/activities/:account/spaces/count',
    pgReqHandlers.spaceActivitiesCountHandler
  )

  router.get('/activities/:account/counts', pgReqHandlers.activityCountsHandler)

  router.post('/accounts/setSessionKey', pgReqHandlers.setSessionKeyHandler)
  router.get('/accounts/getSessionKey', pgReqHandlers.getSessionKeyHandler)
  router.get('/accounts/getNonce', pgReqHandlers.getNonceHandler)

  router.post('/telegram/setTelegramData', pgReqHandlers.setTelegramDataHandler)
  router.post('/telegram/setCurrentAccount', pgReqHandlers.setCurrentAccountHandler)
  router.post('/telegram/setLastPush', pgReqHandlers.setLastPushHandler)
  router.get(
    '/telegram/getAccountByChatId/:chatId',
    pgReqHandlers.getAccountByChatIdHandler
  )
  router.get('/telegram/getTelegramChat', pgReqHandlers.getTelegramChatHandler)
  router.post(
    '/telegram/updateTelegramChat',
    pgReqHandlers.updateTelegramChatHandler
  )

  router.post('/email/addEmailSettings', pgReqHandlers.addEmailSettingsHandler)
  router.get('/email/getEmailSettings', pgReqHandlers.getEmailSettingsHandler)
  router.post(
    '/email/sendConfirmationLetter',
    pgReqHandlers.sendConfirmationLetterHandler
  )
  router.post(
    '/email/setConfirmationDate',
    pgReqHandlers.confirmEmailForSettingsHandler
  )
  router.post('/email/confirm', emailHandlers.confirmEmailHandler)

  router.get('/stats/getStatisticData', pgReqHandlers.getStatisticDataHandler)
  router.get('/stats/getActivityCount', pgReqHandlers.getActivityCountByEventHandler)
  router.get(
    '/stats/getActivityCountForToday',
    pgReqHandlers.getActivityCountForTodayHandler
  )

  // router.post('/faucet/confirm', faucetReqHandlers.confirmEmailHandler)
  // router.post('/faucet/drop', faucetReqHandlers.tokenDropHandler)
  // router.get('/faucet/status', faucetReqHandlers.getFaucetStatus)

  router.post(
    '/contributions/add',
    checkSessionKeySignature,
    pgReqHandlers.addContributionHandler
  )
  router.get('/contributions/:refCode', pgReqHandlers.getContributionsByRefIdHandler)

  // router.post('/parseSite', async (req: express.Request, res: express.Response) => {
  //   const url = req.body.url

  //   if (isEmptyStr(url)) {
  //     res.status(400).send()
  //   }

  //   const data = await parseSitePreview(url)
  //   res.send(data)
  // })

  router.get('/moderation/list', moderationHandlers.getBlockListHandler)

  router.get('/tokensale/snapshot/:account', tokensaleHandlers.isAccountFromSnapshotHandler)
  router.get('/tokensale/email/:account', tokensaleHandlers.getLinkedEmailByAccountHandler)
  router.post('/tokensale/email/link', checkRegularSignature, tokensaleHandlers.upsertEmailByAccountHandler)

  router.get('/polls/:pollId/:account/vote', votesHandlers.getVoteByAccountAndPollHandler)
  router.get('/polls/:pollId/votes', votesHandlers.getVoteByPollHandler)
  router.get('/polls/:pollId/data', votesHandlers.getVotesDataByPollIdAndVoteHandler)
  router.get('/polls/eligibility/:account', votesHandlers.isAccountEligibleForVoteHandler)
  router.post('/polls/upsert', checkRegularSignature, votesHandlers.upsertVoteHandler)

  return router
}

export default createOffchainRoutes