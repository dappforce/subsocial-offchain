import { HandlerFn } from "../utils";
import { moderationApi } from '../watchers/moderation'

export const getModerationHandler: HandlerFn = async (_req, res) => {
  res.json(moderationApi.blockList)
}