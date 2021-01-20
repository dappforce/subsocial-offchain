import { addEmailWithConfirmCode } from './../../postgres/inserts/insertEmailSettings';
import { validateHuman } from '../captcha';
import { sendFaucetConfirmationLetter } from '../email/confirmation';
import { checkWasTokenDrop } from '../faucet/check';
import { BaseConfirmData, FaucetFormData } from '../faucet/types';
import { HandlerFn } from '../utils';
import { tokenDrop } from '../faucet/drop';

export const confirmEmailHandler: HandlerFn = async (req, res) => {
  const formData: FaucetFormData = req.body;

  const human = await validateHuman(formData.token);
  if (!human) {
    res.status(400);
    res.json({ error: 'Please, you\'re not fooling us, bot.' });
  }

  const { ok, errors } = await checkWasTokenDrop(formData)

  console.log('errors', errors, ok)

  if (ok) {
    const confirmationCode = await sendFaucetConfirmationLetter(formData.email)
    console.log('confirmationCode', confirmationCode)
    confirmationCode && await addEmailWithConfirmCode({ ...formData, confirmationCode })
    res.status(200);
    res.json({ ok });
  } else {
    res.status(401);
    res.json({ errors });
  }
};

export const tokenDropHandler: HandlerFn = async (req, res) => {
  const data = req.body as BaseConfirmData
  const { ok, errors } = await tokenDrop(data)

  if (ok) {
    res.status(200).send({ ok })
  } else {
    res.status(400).send({ errors })
  }
}