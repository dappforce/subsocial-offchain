import { BlockNumber } from '@polkadot/types/interfaces';

type Action = 'readAll' | 'addSessionKey'

export type AddSessionKeyArgs = {
  sessionKey: string
}

export type ReadAllMessage = {
  blockNumber: BlockNumber,
  eventIndex: number
}

export type MessageGenericExtends = AddSessionKeyArgs | ReadAllMessage

export type Message<T extends MessageGenericExtends> = {
  nonce: number,
  action: Action,
  args: T
}

export type SessionCall<T extends MessageGenericExtends> = {
  account: string,
  signature: string,
  message: Message<T>
}