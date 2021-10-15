import { startUnreadCountWs } from "./notifications"
import { startActivityWs } from "./activity-tg"

/** Start web sockets for web app and Telegram notifications. */
export const startWebSockets = () => {
  startActivityWs()
  startUnreadCountWs()
}