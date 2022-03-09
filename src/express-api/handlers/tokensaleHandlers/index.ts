import { UpsertLinkedEmail } from "../../../models/linked-emails"
import { upsertLinkedEmail } from "../../../postgres/inserts/insertLinkedEmail"
import { getLinkedEmailByAccount } from "../../../postgres/selects/getLinkedEmailByAccount"
import { HandlerFn, parseParamsWithAccount, resolvePromiseAndReturnJson } from "../../utils"
import { isAccountFromSnapshot } from "./utils"

export const getLinkedEmailByAccountHandler: HandlerFn = (req, res) => {
  const { account } = parseParamsWithAccount(req.params)
  return resolvePromiseAndReturnJson(res, getLinkedEmailByAccount({ account }))
}

export const upsertEmailByAccountHandler: HandlerFn = (req, res) => {
  const params = parseParamsWithAccount(req.body) as UpsertLinkedEmail
  return resolvePromiseAndReturnJson(res, upsertLinkedEmail(params))
}

export const isAccountFromSnapshotHandler: HandlerFn = (req, res) => {
  const { account } = parseParamsWithAccount(req.params)
  res.json(isAccountFromSnapshot(account))
}