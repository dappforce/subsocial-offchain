import { SignMessage } from "../common"

export type UpsertLinkedEmailMessage = {
  email: string
}

export type UpsertLinkedEmail = SignMessage<UpsertLinkedEmailMessage>