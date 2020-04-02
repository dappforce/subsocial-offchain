
import { postgesLog as log } from '../adaptors/loggers';

export { log };

type StructLiteral = 'post' | 'blog' | 'comment' | 'account' | 'owner' | 'post reaction' | 'comment reaction';

export const logSuccess = (operation: string, structName: string) => log.debug(`Succeeded to ${operation} ${structName}`)
export const logError = (operation: string, structName: string, error: any) => log.error(`Failed to ${operation} ${structName}. Error:`, error)

// delete notifications

const deleteNotifications = 'delete notifications of';

export const deleteNotificationsLog = (structName: StructLiteral) => {
  logSuccess(deleteNotifications, structName)
}

export const deleteNotificationsLogError = (structName: StructLiteral, error: any) => {
  logError(deleteNotifications, structName, error)
}

// delete followers

const deleteFollowers = 'delete followers of'

export const deleteFollowersLog = (structName: StructLiteral) => {
  logSuccess(deleteFollowers, structName)
}

export const deleteFollowersLogError = (structName: StructLiteral, error: any) => {
  logError(deleteFollowers, structName, error)
}

// fill activity stream

const fillNotifications = 'fill notificatons followers of'

export const fillNotificationsLog = (structName: StructLiteral) => {
  logSuccess(fillNotifications, structName)
}

export const fillNotificationsLogError = (structName: StructLiteral, error: any) => {
  logError(fillNotifications, structName, error)
}

const fillNewsFeed = 'fill news feed followers of'

export const fillNewsFeedLog = (structName: StructLiteral) => {
  logSuccess(fillNewsFeed, structName)
}

export const fillNewsFeedLogError = (structName: StructLiteral, error: any) => {
  logError(fillNewsFeed, structName, error)
}

// insert followers

const insertFollowers = 'insert followers of'

export const insertFollowersLog = (structName: StructLiteral) => {
  logSuccess(insertFollowers, structName)
}

export const insertFollowersLogError = (structName: StructLiteral, error: any) => {
  logError(insertFollowers, structName, error)
}

// insert activity
const insertActivity = 'insert for';

export const insertActivityLog = (structName: StructLiteral) => {
  logSuccess(insertActivity, structName)
}

export const insertActivityLogError = (structName: StructLiteral, error: any) => {
  logError(insertActivity, structName, error)
}

export const emptyParamsLogError = (structName: StructLiteral) => {
  logError(insertActivity, structName, 'Empty struct params ids')
}
export const updateCountLog = (count: number) => log.debug(`Update ${count} count`)
