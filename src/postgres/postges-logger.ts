import { postgesLog as log } from '../connections/loggers';

export { log };

export const logSuccess = (operation: string, structName: string) =>
  log.debug(`Succeeded to ${operation} ${structName}`)

export const logError = (operation: string, structName: string, error: any) =>
  log.error(`Failed to ${operation} ${structName}. Error: ${error}`)

type StructName = 'post' | 'space' | 'comment' | 'account' | 'owner' | 'post reaction' | 'comment reaction';

const insertActivity = 'insert for';

export const emptyParamsLogError = (structName: StructName) => {
  logError(insertActivity, structName, 'Empty struct params ids')
}
export const updateCountLog = (count: number) => log.debug(`Update ${count} count`)
