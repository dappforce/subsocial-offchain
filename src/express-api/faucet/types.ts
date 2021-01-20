export type FaucetFormData = {
  account: string,
  email: string,
  token: string
}

export type TokenDropsColumns = {
  faucet: string,
  account: string,
  amount: number,
  captcha_solved: boolean,
  email?: string,
  telegram_id?: string,
  discord_id?: string
}

export type BaseConfirmData = {
  account: string,
  confirmationCode: string
}