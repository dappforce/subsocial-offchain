import { BlockNumber } from '@polkadot/types/interfaces';

type Action = 'readAll' | 'addSessionKey' | 'setUpEmail' | 'confirmEmail' | 'addRefContribution' | 'addContent'

export type AddSessionKeyArgs = {
  sessionKey: string
}

export type ReadAllMessage = {
  blockNumber: BlockNumber,
  eventIndex: number
}

export type Message<T> = {
  nonce: number,
  action: Action,
  args: T
}

export type SessionCall<T> = {
  account: string,
  signature: string,
  message: Message<T>
}

export type SetUpEmailArgs = {
	email: string,
	periodicity: string,
	send_feeds: boolean,
	send_notifs: boolean
}

export type ConfirmLetter = {
	email: string
}

export type ConfirmEmail = {
	confirmationCode: string
}