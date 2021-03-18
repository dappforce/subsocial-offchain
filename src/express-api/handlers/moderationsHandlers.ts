import { HandlerFn } from "../utils";
import { blockListApi } from '../watchers/block-list'

export const getBlockListHandler: HandlerFn = async (_req, res) => {
  res.json(blockListApi.blockList)
}