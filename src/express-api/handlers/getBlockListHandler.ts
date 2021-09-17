import { HandlerFn } from "../utils";
import { moderationApi } from '../watchers/moderation'

export const getBlockListHandler: HandlerFn = async (_req, res) => {
  res.json(moderationApi.blockList)
}