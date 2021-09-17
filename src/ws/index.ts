import { startNotificationsServer } from "./notifications"
import { startNotificationsServerForTelegram } from "./telegram"

/** Start web sockets for web app and Telegram notifications. */
export const startWebSockets = () => {
  startNotificationsServerForTelegram()
  startNotificationsServer()
}