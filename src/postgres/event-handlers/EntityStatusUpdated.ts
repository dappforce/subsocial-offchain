import { EntityId } from "@subsocial/types/substrate/interfaces";
import { EventHandlerFn } from "../../substrate/types";
import { insertActivityForReportStatus } from "../inserts/insertActivityForReportStatus";
import { insertModerationEntityStatus } from "../inserts/insertModerationEntityStatus";
import { insertNotificationForOwner } from "../inserts/insertNotificationForOwner";
import { findEntityOwner } from "./utils";

export const onEntityStatusUpdated: EventHandlerFn = async (event) => {
  insertModerationEntityStatus(event.data)

  const insertResult = await insertActivityForReportStatus(event)
  if (!insertResult) return

  const owner = await findEntityOwner(event.data[2] as EntityId)
  if (!owner) return

  insertNotificationForOwner({ account: owner, ...event })
}