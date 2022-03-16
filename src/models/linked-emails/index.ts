import { SignedMessage } from "../common"

export type UpsertLinkedEmailMessage = {
  email: string
}

/** A signed message. */
export type UpsertLinkedEmail = SignedMessage<UpsertLinkedEmailMessage>