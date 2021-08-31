import { Periodicity } from "../utils"

export type FaucetFormData = {
  account: string,
  email: string,
  token: string,
  periodicity?: Periodicity,
}

export type TokenDropsColumns = {
  block_number: BigInt,
  event_index: number,
  faucet: string,
  account: string,
  amount: number,
  captcha_solved: boolean,
  email?: string | null,
  telegram_id?: string | null,
  discord_id?: string | null
}

export type BaseConfirmData = {
  account: string,
  confirmationCode: string
}