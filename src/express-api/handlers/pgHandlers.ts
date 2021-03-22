import * as express from 'express'
import * as pgQueries from '../../postgres/queries';
import { GetActivitiesFn, GetCountFn, GetCountsFn } from '../../postgres/queries/types';
import { setTelegramData } from '../../postgres/inserts/insertTelegramData'
import { addSessionKey } from '../../postgres/inserts/insertSessionKey'
import { getNonce } from '../../postgres/selects/getNonce'
import { SessionCall, AddSessionKeyArgs, SetUpEmailArgs, ConfirmEmail, ConfirmLetter } from '../../postgres/types/sessionKey';
import { updateTelegramChat } from '../../postgres/updates/updateTelegramChat';
import { getTelegramChat } from '../../postgres/selects/getTelegramChat';
import { getAccountByChatId } from '../../postgres/selects/getAccountByChatId';
import { changeCurrentAccount } from '../../postgres/updates/changeCurrentAccount';
import { updateLastPush } from '../../postgres/updates/updateLastPush';
import { getSessionKey } from '../../postgres/selects/getSessionKey';
import { addEmailSettings } from '../../postgres/inserts/insertEmailSettings';
import { getEmailSettingsByAccount } from '../../postgres/selects/getEmailSettings';
import { sendNotifConfirmationLetter } from '../email/confirmation';
import {
  getOffsetFromRequest,
  getLimitFromRequest,
  resolvePromiseAndReturnJson,
  HandlerFn,
} from '../utils'
import { getDateAndCountByActivities } from '../../postgres/selects/getDateAndCountByActivities';
import { getActivityCountByEvent } from '../../postgres/selects/getActivityCountByEvent';
import { getActivityCountForToday } from '../../postgres/selects/getActivityCountForToday';
import { setConfirmationDateForSettings } from '../../postgres/updates/setConfirmationDate';


const activityHandler = (
  req: express.Request,
  res: express.Response,
  method: GetActivitiesFn
) => {
  const offset = getOffsetFromRequest(req)
  const limit = getLimitFromRequest(req)
  const account = req.params.id
  return resolvePromiseAndReturnJson(res, method({ account, offset, limit }))
}

const countHandler = async (
  req: express.Request,
  res: express.Response,
  method: GetCountFn | GetCountsFn
) => {
  const account = req.params.id
  return resolvePromiseAndReturnJson(res, method(account))
}

export const feedHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getFeedData)

export const feedCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getFeedCount)

export const notificationsHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getNotificationsData)

export const notificationsCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getNotificationsCount)

export const activitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getActivitiesData)

export const activitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getActivitiesCount)

export const commentActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getCommentActivitiesData)

export const commentActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getCommentActivitiesCount)

export const followActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getFollowActivitiesData)

export const followActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getFollowActivitiesCount)

export const postActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getPostActivitiesData)

export const postActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getPostActivitiesCount)

export const reactionActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getReactionActivitiesData)

export const reactionActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getReactionActivitiesCount)

export const spaceActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, pgQueries.getSpaceActivitiesData)

export const spaceActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getSpaceActivitiesCount)

export const activityCountsHandler: HandlerFn = (req, res) =>
  countHandler(req, res, pgQueries.getActivityCounts)


export const setSessionKeyHandler: HandlerFn = (req, res) =>
  resolvePromiseAndReturnJson(res, addSessionKey(req.body.sessionCall as SessionCall<AddSessionKeyArgs>))

export const getSessionKeyHandler: HandlerFn = (req, res) => {
  const account = req.query.account as string
  return resolvePromiseAndReturnJson(res, getSessionKey(account))
}

export const getNonceHandler: HandlerFn = (req, res) => {
  const account = req.query.account as string
  return resolvePromiseAndReturnJson(res, getNonce(account))
}


export const setTelegramDataHandler: HandlerFn = (req, res) => {
  const { account, chatId } = req.body
  return resolvePromiseAndReturnJson(res, setTelegramData(account, Number(chatId)))
}

export const setCurrentAccountHandler: HandlerFn = (req, res) => {
  const { account, chatId } = req.body;
  return resolvePromiseAndReturnJson(res, changeCurrentAccount(account.toString(), Number(chatId)))
}

export const setLastPushHandler: HandlerFn = (req, res) => {
  const { account, chatId, blockNumber, eventIndex } = req.body;
  return resolvePromiseAndReturnJson(res, updateLastPush(account.toString(), Number(chatId), blockNumber, eventIndex))
}

export const getAccountByChatIdHandler: HandlerFn = (req, res) => {
  const { chatId } = req.params
  return resolvePromiseAndReturnJson(res, getAccountByChatId(Number(chatId)))
}

export const getTelegramChatHandler: HandlerFn = (req, res) => {
  const { account, chatId } = req.query;
  return resolvePromiseAndReturnJson(res, getTelegramChat(account.toString(), Number(chatId)))
}

export const updateTelegramChatHandler: HandlerFn = (req, res) => {
  const { account, chatId, push_notifs, push_feeds } = req.body;
  return resolvePromiseAndReturnJson(res, updateTelegramChat(account.toString(), Number(chatId), push_notifs, push_feeds))
}

export const addEmailSettingsHandler: HandlerFn = (req, res) => {
  return resolvePromiseAndReturnJson(res, addEmailSettings(req.body.sessionCall as SessionCall<SetUpEmailArgs>))
}

export const getEmailSettingsHandler: HandlerFn = (req, res) => {
  const account = req.query.account as string
  return resolvePromiseAndReturnJson(res, getEmailSettingsByAccount(account))
}

export const sendConfirmationLetterHandler: HandlerFn = (req, res) => {
  return resolvePromiseAndReturnJson(res, sendNotifConfirmationLetter(req.body.sessionCall as SessionCall<ConfirmLetter>))
}

export const confirmEmailForSettingsHandler: HandlerFn = (req, res) => {
  return resolvePromiseAndReturnJson(res, setConfirmationDateForSettings(req.body.sessionCall as SessionCall<ConfirmEmail>))
}

export const getStatisticDataHandler: HandlerFn = (req, res) => {
  const {event, period} = req.query
  return resolvePromiseAndReturnJson(res, getDateAndCountByActivities(event.toString(), period.toString()))
}

export const getActivityCountByEventHandler: HandlerFn = (req, res) => {
  const {event, period} = req.query
  return resolvePromiseAndReturnJson(res, getActivityCountByEvent(event.toString(), period.toString()))
}

export const getActivityCountForTodayHandler: HandlerFn = (req, res) => {
  const event = req.query.event
  return resolvePromiseAndReturnJson(res, getActivityCountForToday(event.toString()))
}