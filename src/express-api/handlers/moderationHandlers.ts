import { getEntityStatusByEntityKind } from "../../postgres/selects/getEntityStatusByEntityKind";
import { EntityKind } from "../../substrate/types";
import { HandlerFn, resolvePromiseAndReturnJson } from "../utils";

export const getEntityStatusByEntityKindHandler: HandlerFn = async (req, res) => {
  const { kind, id } = req.params
  resolvePromiseAndReturnJson(res, getEntityStatusByEntityKind(kind as EntityKind,id))
}