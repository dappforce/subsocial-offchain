import { resolveSubsocialApi } from '../../connections';
import { checkDropByAccountAndEmail } from '../../postgres/selects/checkDropByAccountAndEmail';
import { formattingEmail } from '../email/formatting-email';
import { OkOrError } from '../utils';
import { checkFaucetIsActive } from './status';
import { FaucetFormData } from "./types";

export async function checkWasTokenDrop({ account, email }: Omit<FaucetFormData, 'token'>): Promise<OkOrError> {
  const formattedEmail = formattingEmail(email)
  const {
    account: foundAccount,
    original_email,
    formatted_email: foundEmail
  } = await checkDropByAccountAndEmail(account, formattedEmail)

  const errors: Record<string, string> = {}
  let ok = true

  if (foundAccount === account) { 
    ok = false
    errors.account = 'On this account already had droped tokens'
  }

  if (foundEmail === formattedEmail) { 
    ok = false
    errors.email = `On this email "${original_email}" already had droped tokens`
  }

  const { api } = await resolveSubsocialApi()

  const { freeBalance } = await api.derive.balances.all(account)
  
  if (!freeBalance.eqn(0)) { 
    ok = false
    errors.account = 'This account already had tokens'
  }

  const { ok: isActiveFaucet, errors: faucetErrors } = await checkFaucetIsActive()

  ok = ok && isActiveFaucet

  return { ok, errors: { ...errors, ...faucetErrors } };
}
