import { resolveSubsocialApi } from '../../connections';
// import { checkDropByAccountAndEmail } from '../../postgres/selects/checkDropByAccountAndEmail';
import { isValidEmailProvider } from '@subsocial/utils/email';
import { OkOrError } from '../utils';
import { checkFaucetIsActive } from './status';
import { FaucetFormData } from "./types";
import { getFaucetDripAmount } from './utils';

export async function checkWasTokenDrop({ account, email }: Omit<FaucetFormData, 'token'>): Promise<OkOrError> {
  
  if (!isValidEmailProvider(email)) return {
    ok: false,
    errors: { email: 'This email domain is not supported, sorry' }
  }

  // const formattedEmail = formatEmail(email)

  // const {
  //   account: foundAccount,
  //   original_email,
  //   formatted_email: foundEmail
  // } = await checkDropByAccountAndEmail(account, formattedEmail)

  const errors: Record<string, string> = {}
  let ok = true

  // if (foundAccount === account) { 
  //   ok = false
  //   errors.account = 'On this account already had droped tokens'
  // }

  // if (foundEmail === formattedEmail) { 
  //   ok = false
  //   errors.email = `On this email "${original_email}" already had droped tokens`
  // }

  const { api } = await resolveSubsocialApi()

  const { freeBalance } = await api.derive.balances.all(account)
  const faucetDripAmount = getFaucetDripAmount()
  
  if (freeBalance.gte(faucetDripAmount)) { // TODO: check lt(maxBalanceForDrip)
    ok = false
    errors.account = 'There are still enough coins in this account'
  }

  const { ok: isActiveFaucet, errors: faucetErrors } = await checkFaucetIsActive()

  ok = ok && isActiveFaucet

  return { ok, errors: { ...errors, ...faucetErrors } };
}
