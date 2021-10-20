import { asAccountId } from "@subsocial/api";
import { getEntityStatusByEntityKind } from "../../postgres/selects/getEntityStatusByEntityKind";
import { getReportIdsByScope } from "../../postgres/selects/getReportsByScope";
import { EntityKind } from "../../substrate/types";
import { HandlerFn, resolvePromiseAndReturnJson } from "../utils";

export const getEntityStatusByEntityKindHandler: HandlerFn = async (req, res) => {
  const { kind, id } = req.params

  const entityKind = kind as EntityKind
  const entityId = entityKind === 'Account' ? asAccountId(id).toString() : id

  resolvePromiseAndReturnJson(res, getEntityStatusByEntityKind(entityKind, entityId))
}

export const getReportIdsByScopeId: HandlerFn = (req, res) => {
  const scopeId = req.params.scopeId
  return resolvePromiseAndReturnJson(res, getReportIdsByScope(scopeId))
}