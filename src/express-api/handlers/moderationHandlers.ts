import { getEntityStatusByEntityKind } from "../../postgres/selects/getEntityStatusByEntityKind";
import { getReportIdsByScope } from "../../postgres/selects/getReportsByScope";
import { EntityKind } from "../../substrate/types";
import { HandlerFn, resolvePromiseAndReturnJson } from "../utils";

export const getEntityStatusByEntityKindHandler: HandlerFn = async (req, res) => {
  const { kind, id } = req.params
  resolvePromiseAndReturnJson(res, getEntityStatusByEntityKind(kind as EntityKind,id))
}

export const getReportIdsByScopeId: HandlerFn = (req, res) => {
  const scopeId = req.params.scopeId
  return resolvePromiseAndReturnJson(res, getReportIdsByScope(scopeId))
}