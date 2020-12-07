import { pg } from '../connections/postgres';
import { signatureVerify } from '@polkadot/util-crypto';
import { SessionCall, MessageGenericExtends } from './types/sessionKey';
import {sortObj} from 'jsonabc'
import { isEmptyObj } from '@subsocial/utils';
import { insertNonce } from './inserts/insertNonce';
import { updateNonce } from './updates/updateNonce';
import { QueryResult } from './updates/markAllNotifsAsRead';

const named = require('yesql').pg

export type action = 'SpaceCreated' | 'SpaceUpdated' | 'SpaceFollowed' | 'SpaceUnfollowed' | 'AccountFollowed' | 'AccountUnfollowed' | 'PostCreated' | 'PostUpdated' | 'PostShared' | 'CommentCreated' | 'CommentUpdated' | 'CommentShared' | 'CommentDeleted' | 'CommentReplyCreated' | 'PostReactionCreated' | 'PostReactionUpdated' | 'CommentReactionCreated' | 'CommentReactionUpdated';

export const newPgError = (err: Error, fn: Function) =>
  new Error(`${fn.name}: ${err.stack}\n${JSON.stringify(err, null, 4)}`)

export const runQuery = async <T>(query: string, params: T) => {
  const result = await pg.query(named(query)(params))
  return result
}

export const isValidSignature = (sessionCall: SessionCall<MessageGenericExtends>) => {
  const {message, signature, account} = sessionCall
  const signedMessage = JSON.stringify(sortObj(message))
  return signatureVerify(signedMessage, signature, account).isValid;
};

export const menageNonce = async (selectedNonce: QueryResult | undefined , nonce: number, account: string) => {
  if(isEmptyObj(selectedNonce))
    await insertNonce(account, nonce)
  else {
    if(parseInt(selectedNonce.nonce.toString()) + 1 !== nonce) return
    await updateNonce(account, nonce)
  }
}
