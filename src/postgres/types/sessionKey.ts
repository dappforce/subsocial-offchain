import { BlockNumber } from '@polkadot/types/interfaces';

type Action = 'readAll' | 'addSessionKey'

export type Protocol = 'WebApp' | 'Telegram' | 'Email'

export type SessionKeyMessage = {
  mainKey: string,
  sessionKey: string,
  protocol: Protocol
}

export type ReadAllMessage = {
  sessionKey: string,
  blockNumber: BlockNumber,
  eventIndex: number
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