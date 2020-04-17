
import { postgesLog as log } from '../connections/loggers';

export { log };

export const logSuccess = (operation: string, structName: string) =>
  log.debug(`Succeeded to ${operation} ${structName}`)

export const logError = (operation: string, structName: string, error: any) =>
  log.error(`Failed to ${operation} ${structName}. Error:`, error)

type StructName = 'post' | 'blog' | 'comment' | 'account' | 'owner' | 'post reaction' | 'comment reaction';

// delete notifications

const deleteNotifications = 'delete notifications of';

export const deleteNotificationsLog = (structName: StructName) => {
  logSuccess(deleteNotifications, structName)
}

export const deleteNotificationsLogError = (structName: StructName, error: any) => {
  logError(deleteNotifications, structName, error)
}

// delete followers

const deleteFollowers = 'delete followers of'

export const deleteFollowersLog = (structName: StructName) => {
  logSuccess(deleteFollowers, structName)
}

export const deleteFollowersLogError = (structName: StructName, error: any) => {
  logError(deleteFollowers, structName, error)
}

// fill activity stream

const fillNotifications = 'fill notificatons followers of'

export const fillNotificationsLog = (structName: StructName) => {
  logSuccess(fillNotifications, structName)
}

export const fillNotificationsLogError = (structName: StructName, error: any) => {
  logError(fillNotifications, structName, error)
}

const fillNewsFeed = 'fill news feed followers of'

export const fillNewsFeedLog = (structName: StructName) => {
  logSuccess(fillNewsFeed, structName)
}

export const fillNewsFeedLogError = (structName: StructName, error: any) => {
  logError(fillNewsFeed, structName, error)
}

// insert followers

const insertFollowers = 'insert followers of'

export const insertFollowersLog = (structName: StructName) => {
  logSuccess(insertFollowers, structName)
}

export const insertFollowersLogError = (structName: StructName, error: any) => {
  logError(insertFollowers, structName, error)
}

// insert activity
const insertActivity = 'insert for';

export const insertActivityLog = (structName: StructName) => {
  logSuccess(insertActivity, structName)
}

export const insertActivityLogError = (structName: StructName, error: any) => {
  logError(insertActivity, structName, error)
}

export const emptyParamsLogError = (structName: StructName) => {
  logError(insertActivity, structName, 'Empty struct params ids')
}
export const updateCountLog = (count: number) => log.debug(`Update ${count} count`)
