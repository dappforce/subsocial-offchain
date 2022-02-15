export type SignMessage<T> = {
  account: string,
  signature: string,
  message: T
}