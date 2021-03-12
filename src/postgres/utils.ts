import { pg } from '../connections/postgres';
import { signatureVerify } from '@polkadot/util-crypto';
import { SessionCall, MessageGenericExtends, Message } from './types/sessionKey';
import { insertNonce } from './inserts/insertNonce';
import { getNonce } from './selects/getNonce';
import { getAccountFromSessionKey } from './selects/getAccountBySessionKey';
import { sortObj } from 'jsonabc'
import { log as postgresLog } from './postges-logger';

const named = require('yesql').pg

export type Tables = 'activities' | 'token_drops'

export type action = 'SpaceCreated' | 'SpaceUpdated' | 'SpaceFollowed' | 'SpaceUnfollowed' | 'AccountFollowed' | 'AccountUnfollowed' | 'PostCreated' | 'PostUpdated' | 'PostShared' | 'CommentCreated' | 'CommentUpdated' | 'CommentShared' | 'CommentDeleted' | 'CommentReplyCreated' | 'PostReactionCreated' | 'PostReactionUpdated' | 'CommentReactionCreated' | 'CommentReactionUpdated';

export const newPgError = (err: Error, fn: Function) =>
  new Error(`${fn.name}: ${err.stack}\n${JSON.stringify(err, null, 4)}`)

export const runQuery = async <T>(query: string, params?: T) => {
  const result = await pg.query(named(query)(params))
  return result
}

export const isValidSignature = (sessionCall: SessionCall<MessageGenericExtends>) => {
  const { message, signature, account } = sessionCall
  const signedMessage = JSON.stringify(sortObj(message))
  return signatureVerify(signedMessage, signature, account).isValid;
}

type RootAddressWithNonce = {
  rootAddress: string,
  nonce: any
}

export const upsertNonce = async <T extends MessageGenericExtends>(account: string, message: Message<T>): Promise<RootAddressWithNonce> => {
  let rootAddress = await getAccountFromSessionKey(account)
  if (!rootAddress) {
    postgresLog.error(`There is no account that owns this session key: ${account}`)
    rootAddress = account
  }

  let selectedNonce = await getNonce(account)

  if (!selectedNonce) {
    await insertNonce(account, message.nonce)
    selectedNonce = 0
  }

  return { rootAddress, nonce: selectedNonce }
}