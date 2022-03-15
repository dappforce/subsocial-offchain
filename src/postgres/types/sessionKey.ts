import { BlockNumber } from '@polkadot/types/interfaces';
import { SignedMessage } from '../../models/common';

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

export type SessionCall<T> = SignedMessage<Message<T>>

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