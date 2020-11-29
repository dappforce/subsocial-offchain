import { pg } from '../connections/postgres';
import { signatureVerify } from '@polkadot/util-crypto';

const named = require('yesql').pg

export type action = 'SpaceCreated' | 'SpaceUpdated' | 'SpaceFollowed' | 'SpaceUnfollowed' | 'AccountFollowed' | 'AccountUnfollowed' | 'PostCreated' | 'PostUpdated' | 'PostShared' | 'CommentCreated' | 'CommentUpdated' | 'CommentShared' | 'CommentDeleted' | 'CommentReplyCreated' | 'PostReactionCreated' | 'PostReactionUpdated' | 'CommentReactionCreated' | 'CommentReactionUpdated';

export const newPgError = (err: Error, fn: Function) =>
  new Error(`${fn.name}: ${err.stack}\n${JSON.stringify(err, null, 4)}`)

export const runQuery = async <T>(query: string, params: T) => {
  const result = await pg.query(named(query)(params))
  return result
}

export const isValidSignature = (signedMessage: any, signature: string, address: string) => {
  const message = JSON.stringify(signedMessage)
  return signatureVerify(message, signature, address).isValid;
};