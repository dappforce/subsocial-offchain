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

type MsgFn = () => string

type Msg = string | MsgFn

type CallbackMessage = {
  success?: Msg,
  error: Msg
}

type TryFn = (callback: () => any, msg: CallbackMessage) => Promise<any>

const resolveMsg = (msg?: Msg) => {
  if (!msg) return undefined

  return typeof msg === 'function' ? msg() : msg
} 

export const tryPgQeury: TryFn = async (callback, { success, error }) => {
  try {
    await callback()
    log.debug(resolveMsg(success))
  } catch (err) {
    log.error(resolveMsg(error), err.stack)
    throw err
  }
};