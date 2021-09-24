import { HandlerFn, Periodicity } from '../utils';
import { sendConfirmationLetter, confirmationMsgForSetting } from '../email/confirmation';
import { addEmailWithConfirmCode } from '../../postgres/inserts/insertEmailSettings';
import { GenericAccountId } from '@polkadot/types';
import registry from '@subsocial/types/substrate/registry'

type EmailSettingsParams = {
	account: string,
	email: string,
  periodicity?: Periodicity
}

const getSubsocialAccountId = (account: string) => new GenericAccountId(registry, account).toString()

export const confirmEmailHandler: HandlerFn = async (req, res) => {
  const { account: address, email, periodicity}: EmailSettingsParams = req.body;

  const account = getSubsocialAccountId(address)

  const confirmationCode = await sendConfirmationLetter({
    subject: 'Confirm your email',
    email, url: 'settings/email/confirm-email',
    customTemplate: { message: confirmationMsgForSetting },
  })
  confirmationCode && await addEmailWithConfirmCode({ account, email, periodicity, confirmationCode })
  res.status(200);
  res.json({ ok: true });
};