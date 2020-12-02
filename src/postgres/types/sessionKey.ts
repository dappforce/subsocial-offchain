import { BlockNumber } from '@polkadot/types/interfaces';

type Action = 'readAll' | 'addSessionKey'

export type SessionKeyMessage = {
  mainKey: string,
  sessionKey: string,
  nonce: number
}

export type ReadAllMessage = {
  sessionKey: string,
  blockNumber: BlockNumber,
  eventIndex: number,
  nonce: number
}

export type MessageGenericExtends = SessionKeyMessage | ReadAllMessage

export type Message<T extends MessageGenericExtends> = {
  action: Action,
  args: T
}

export type SessionCall<T extends MessageGenericExtends> = {
  account: string,
  signature: string,
  message: Message<T>
}