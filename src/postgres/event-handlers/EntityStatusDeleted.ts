import { onEntityStatusUpdated } from ".";
import { EventHandlerFn } from "../../substrate/types";

export const onEntityStatusDeleted: EventHandlerFn = onEntityStatusUpdated