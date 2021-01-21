import { resolveSubsocialApi } from '../../connections';
import { checkDropByAccountAndEmail } from '../../postgres/selects/checkDropByAccountAndEmail';
import { OkOrError } from '../utils';
import { FaucetFormData } from "./types";

export async function checkWasTokenDrop({ account, email }: Omit<FaucetFormData, 'token'>): Promise<OkOrError> {
  const { account: foundAccount, email: foundEmail } = await checkDropByAccountAndEmail(account, email)

  const errors: Record<string, string> = {}
  let ok = true

  if (foundAccount === account) { 
    ok = false
    errors.account = 'The account was drop token yet'
  }

  if (foundEmail === email) { 
    ok = false
    errors.email = 'The email was drop token yet'
  }

  const { api } = await resolveSubsocialApi()

  const { freeBalance } = await api.derive.balances.all(account)
  
  if (!freeBalance.eqn(0)) { 
    ok = false
    errors.account = 'The account haven\'t zero balance'
  }

  return { ok, errors };
}
