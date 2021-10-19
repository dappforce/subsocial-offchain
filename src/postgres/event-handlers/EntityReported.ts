import { EntityId } from "@subsocial/types/substrate/interfaces";
import { EventHandlerFn } from "../../substrate/types";
import { parseEntity } from "../../substrate/utils";
import { informTelegramClientAboutReport } from "../../ws/events";
import { insertActivityForReport } from "../inserts/insertActivityForReport";
import { insertNotificationForOwner } from "../inserts/insertNotificationForOwner";
import { findEntityOwner } from "./utils";

export const onEntityReported: EventHandlerFn = async (event) => {
  const insertResult = await insertActivityForReport(event)
  if (!insertResult) return

  const [accountId, scopeIdBn, entity, reportId ] = event.data

  const owner = await findEntityOwner(event.data[2] as EntityId)
  if (!owner) return

  insertNotificationForOwner({ account: owner, ...event })
  
  informTelegramClientAboutReport({
    who: accountId.toString(),
    entity: parseEntity(entity as EntityId),
    scopeId: scopeIdBn.toString(),
    reportId: reportId.toString()
  })
}