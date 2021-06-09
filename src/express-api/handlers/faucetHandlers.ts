import { addEmailWithConfirmCode } from './../../postgres/inserts/insertEmailSettings';
import { validateHuman } from '../captcha';
import { sendFaucetConfirmationLetter } from '../email/confirmation';
import { checkWasTokenDrop } from '../faucet/check';
import { BaseConfirmData, FaucetFormData } from '../faucet/types';
import { HandlerFn } from '../utils';
import { confirmAndTokenDrop, tokenDrop } from '../faucet/drop';
import { GenericAccountId } from '@polkadot/types';
import { registry } from '@subsocial/types/substrate/registry';
import isEmpty from 'lodash.isempty'
import { getConfirmationData } from '../../postgres/selects/getConfirmationCode';
import { checkFaucetIsActive } from '../faucet/status';
import { getEmailSettingsByAccount } from '../../postgres/selects/getEmailSettings';
import { nonEmptyStr } from '@subsocial/utils';
import { asAccountId } from '@subsocial/api'

const getSubsocialAccountId = (account: string) => new GenericAccountId(registry, account).toString()

export const confirmEmailHandler: HandlerFn = async (req, res) => {
  const formData: FaucetFormData = req.body;

  if (isEmpty(formData)) {
    res.status(400).send({ errors: { account: 'Invalid data' } })
  }
  
  const account = getSubsocialAccountId(formData.account)
  const data = { ...formData, account }

  const human = await validateHuman(data.token);
  if (!human) {
    res.status(403);
  }

  const { ok, errors } = await checkWasTokenDrop(data)

  if (ok) {
    const { confirmed_on } = await getConfirmationData(account) || {}

    if (confirmed_on) {

      const { ok, errors } = await tokenDrop({ account, email: data.email })
      if (ok) {
        res.status(301);
        res.json({ ok, data: { message: 'dropped' } });
      } else {
        res.status(401).json({ errors })
      }

    } 

    const confirmationCode = await sendFaucetConfirmationLetter(data)
    confirmationCode && await addEmailWithConfirmCode({ ...data, confirmationCode })
    res.status(200);
    res.json({ ok });
  } else {
    res.status(403);
    res.json({ errors });
  }
};

export const tokenDropHandler: HandlerFn = async (req, res) => {
  const data = req.body as BaseConfirmData

  if (isEmpty(data)) {
    res.status(400).send({ errors: { account: 'Invalid data' } })
  }

  const account = getSubsocialAccountId(data.account)

  const { ok, errors } = await confirmAndTokenDrop({ ...data, account })
  if (ok) {
    res.status(200).send({ ok })
  } else {
    res.status(400).send({ errors })
  }
}

export const getFaucetStatus: HandlerFn = async (req, res) => {
  const account = asAccountId(req.query.account as string).toString()

  const { ok, errors } = await checkFaucetIsActive(account)

  if (ok) {
    let email = null
    
    if (nonEmptyStr(account)) {
      const { original_email, expires_on } = await getEmailSettingsByAccount(account) || {}
      email = !!expires_on ? original_email : null 
    }
    res.status(200).send({
      ok,
      data: !!email
        ? { email, dropped: true }
        : undefined
    })
  } else {
    res.status(403).send({ errors })
  }
}