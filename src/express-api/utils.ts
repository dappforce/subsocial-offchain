import * as express from 'express';
import { nonEmptyStr, parseNumStr } from '@subsocial/utils';

export const MAX_RESULT_LIMIT = parseNumStr(process.env.RESULTS_LIMIT) || 20

const getNumberFromRequest = (
  req: express.Request,
  value: 'limit' | 'offset',
  def: number
): number => {
  const reqParameter = req.query[value];
  return nonEmptyStr(reqParameter) ? parseNumStr(reqParameter) : def;
};

export const getLimitFromRequest = (req: express.Request, maxLimit?: number): number => {
  const limit = getNumberFromRequest(req, 'limit', maxLimit);
  return isNaN(maxLimit) || limit < maxLimit
    ? limit
    : maxLimit;
};

export const getOffsetFromRequest = (req: express.Request, defaultOffset?: number): number =>
  getNumberFromRequest(req, 'offset', defaultOffset);
