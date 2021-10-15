import { EntityId } from "@subsocial/types/substrate/interfaces";
import { EventHandlerFn } from "../../substrate/types";
import { insertActivityForReport } from "../inserts/insertActivityForReport";
import { insertNotificationForOwner } from "../inserts/insertNotificationForOwner";
import { findEntityOwner } from "./utils";

export const onEntityReported: EventHandlerFn = async (event) => {
  const insertResult = await insertActivityForReport(event)
  if (!insertResult) return

  const owner = await findEntityOwner(event.data[2] as EntityId)
  if (!owner) return

  insertNotificationForOwner({ account: owner, ...event })
}