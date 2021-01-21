import { addEmailWithConfirmCode } from './../../postgres/inserts/insertEmailSettings';
import { validateHuman } from '../captcha';
import { sendFaucetConfirmationLetter } from '../email/confirmation';
import { checkWasTokenDrop } from '../faucet/check';
import { BaseConfirmData, FaucetFormData } from '../faucet/types';
import { HandlerFn } from '../utils';
import { tokenDrop } from '../faucet/drop';
import { GenericAccountId } from '@polkadot/types';
import { registry } from '@subsocial/types/substrate/registry';
import isEmpty from 'lodash.isempty'

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
    res.status(400);
    res.json({ errors: { account: 'Please, you\'re not fooling us, bot.' } });
  }

  const { ok, errors } = await checkWasTokenDrop(data)

  console.log('errors', errors, ok)

  if (ok) {
    const confirmationCode = await sendFaucetConfirmationLetter(data)
    console.log('confirmationCode', confirmationCode)
    confirmationCode && await addEmailWithConfirmCode({ ...data, confirmationCode })
    res.status(200);
    res.json({ ok });
  } else {
    res.status(401);
    res.json({ errors });
  }
};

export const tokenDropHandler: HandlerFn = async (req, res) => {
  const data = req.body as BaseConfirmData

  if (isEmpty(data)) {
    res.status(400).send({ errors: { account: 'Invalid data' } })
  }

  const account = getSubsocialAccountId(data.account)

  const { ok, errors } = await tokenDrop({ ...data, account })
  console.log('tokenDrop', ok, errors)
  if (ok) {
    res.status(200).send({ ok })
  } else {
    res.status(400).send({ errors })
  }
}