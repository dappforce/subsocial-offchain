
import { postgesLog as log } from '../adaptors/loggers';

export { log };

type StructLiteral = 'post' | 'blog' | 'comment' | 'account' | 'owner' | 'post reaction' | 'comment reaction';

export const successfulLog = (operation: string, structName: string) => log.debug(`Successful ${operation} ${structName}`)
export const errorLog = (operation: string, structName: string, error: any) => log.error(`Error ${operation} ${structName}: ${error}`)

// delete notifications

const deleteNotifications = 'deletion of';

export const deleteNotificationsLog = (structName: StructLiteral) => {
  successfulLog(deleteNotifications, structName)
}

export const deleteNotificationsErrorLog = (structName: StructLiteral, error: any) => {
  errorLog(deleteNotifications, structName, error)
}

// delete followers

const deleteFollowers = 'deletion followers of'

export const deleteFollowersLog = (structName: StructLiteral) => {
  successfulLog(deleteFollowers, structName)
}

export const deleteFollowersErrorLog = (structName: StructLiteral, error: any) => {
  errorLog(deleteFollowers, structName, error)
}

// fill activity stream

const fillNotifications = 'fill notificatons followers of'

export const fillNotificationsLog = (structName: StructLiteral) => {
  successfulLog(fillNotifications, structName)
}

export const fillNotificationsErrorLog = (structName: StructLiteral, error: any) => {
  errorLog(fillNotifications, structName, error)
}

const fillNewsFeed = 'fill news feed followers of'

export const fillNewsFeedLog = (structName: StructLiteral) => {
  successfulLog(fillNewsFeed, structName)
}

export const fillNewsFeedErrorLog = (structName: StructLiteral, error: any) => {
  errorLog(fillNewsFeed, structName, error)
}

// insert followers

const insertFollowers = 'insert followers of'

export const insertFollowersLog = (structName: StructLiteral) => {
  successfulLog(insertFollowers, structName)
}

export const insertFollowersErrorLog = (structName: StructLiteral, error: any) => {
  errorLog(insertFollowers, structName, error)
}

// insert activity
const insertActivity = 'insert for';

export const insertActivityLog = (structName: StructLiteral) => {
  successfulLog(insertActivity, structName)
}

export const insertActivityErrorLog = (structName: StructLiteral, error: any) => {
  errorLog(insertActivity, structName, error)
}

export const updateCountLog = (count: number) => log.debug(`Update ${count} count`)
