import { EventHandlerFn } from "../../substrate/types";
import { insertModerationEntityStatus } from "../inserts/insertModerationEntityStatus";

export const onEntityStatusUpdated: EventHandlerFn = async ({ data }) => {
  await insertModerationEntityStatus(data)
}