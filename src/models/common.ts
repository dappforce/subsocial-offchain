export type SignedMessage<T> = {
  account: string
  message: T
  signature: string
}