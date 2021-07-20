import { startNotificationsServer } from "./notifications"
import { startNotificationsServerForTelegram } from "./telegram"

export const startWebSockets = () => {
  startNotificationsServerForTelegram()
  startNotificationsServer()
}