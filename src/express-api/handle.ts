import * as express from 'express'
import { nonEmptyStr, parseNumStr } from '@subsocial/utils';
import { getCommentActivitiesData, getCommentActivitiesCount } from './query/activities/by-event/comments';
import { GetActivityFn, GetCountFn } from './query/types';
import { getFeedData, getNotificationsData, getFeedCount, getNotificationsCount } from './query/feed-and-notifications';
import { getActivitiesData, getActivitiesCount } from './query/activities/all';
import { getFollowActivitiesData, getFollowActivitiesCount } from './query/activities/by-event/follows';
import { getPostActivitiesData, getPostActivitiesCount } from './query/activities/by-event/posts';
import { getReactionActivitiesData, getReactionActivitiesCount } from './query/activities/by-event/reactions';
import { getSpaceActivitiesData, getSpaceActivitiesCount } from './query/activities/by-event/spaces';

const RESULT_LIMIT = parseNumStr(process.env.PGLIMIT) || 20

type HandlerFn = (req: express.Request, res: express.Response) => Promise<void>

const getNumberValueFromRequest = (req: express.Request, value: 'limit' | 'offset', def: number): number => {
  const reqLimit = req.query[value]
  return nonEmptyStr(reqLimit) ? parseNumStr(reqLimit) : def
}

const getLimitFromRequest = (req: express.Request): number => { 
  const limit = getNumberValueFromRequest(req, 'limit', RESULT_LIMIT)
  return limit < RESULT_LIMIT ? limit : RESULT_LIMIT
}

const getOffsetFromRequest = (req: express.Request): number => getNumberValueFromRequest(req, 'offset', 0)

const innerHandler = async (_req: express.Request, res: express.Response, method: Promise<any>) => {
  try {
    const data = await method
    res.json(data);
  } catch (err) {
    res
      .status(501)
      .send(err)
  }
}

const activityHandler = (req: express.Request, res: express.Response, method: GetActivityFn) => {
  const limit = getLimitFromRequest(req);
  const offset = getOffsetFromRequest(req);
  const account = req.params.id;

  return innerHandler(req, res, method({ account, limit, offset }))
}

const countHandler = async  (req: express.Request, res: express.Response, method: GetCountFn) => {
  const account = req.params.id;

  return innerHandler(req, res, method(account))
}

export const feedHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, getFeedData)
export const feedCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, getFeedCount)

export const notificationsHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, getNotificationsData)
export const notificationsCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, getNotificationsCount)

export const activitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, getActivitiesData)
export const activitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, getActivitiesCount)

export const commentActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, getCommentActivitiesData)
export const commentActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, getCommentActivitiesCount)

export const followActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, getFollowActivitiesData)
export const followActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, getFollowActivitiesCount)

export const postActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, getPostActivitiesData)
export const postActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, getPostActivitiesCount)

export const reactionActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, getReactionActivitiesData)
export const reactionActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, getReactionActivitiesCount)

export const spaceActivitiesHandler: HandlerFn = (req, res) =>
  activityHandler(req, res, getSpaceActivitiesData)
export const spaceActivitiesCountHandler: HandlerFn = (req, res) =>
  countHandler(req, res, getSpaceActivitiesCount)

