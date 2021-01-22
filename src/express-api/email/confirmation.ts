import { sendEmail } from './emailSender';
import { v4 } from 'uuid'
import { appsUrl, subsocialLogo } from '../../env';
import { setConfirmationCode } from '../../postgres/updates/setConfirmationCode';
import { SessionCall, ConfirmLetter } from '../../postgres/types/sessionKey';
import { ConfirmationLink } from './types';
import { newLogger } from '@subsocial/utils';
import { FaucetFormData } from '../faucet/types';

type SendConfirmationLetterParams = {
	email: string,
	type: 'faucet-confirmation' | 'notif-confirmation',
	url: string,
	args?: Record<string,string>
}

const log = newLogger(sendConfirmationLetter.name)

export async function sendConfirmationLetter ({ email, url, args, type }: SendConfirmationLetterParams) {
	const confirmationCode = v4()

	const argsStr = args && Object.entries(args).map(([ name, value ]) => `&${name}=${value}`).join()

	const data: ConfirmationLink = {
		link: `${appsUrl}/${url}?confirmationCode=${confirmationCode}${argsStr}`, // TODO: use getFullUrl ?
		image: subsocialLogo
	}

	try {
		await sendEmail(email, data, type)
		return confirmationCode
	} catch (err) {
		log.error("Failed send confirmation:", err)
		return undefined
  }
  
}

export const sendNotifConfirmationLetter = async (sessionCall: SessionCall<ConfirmLetter>)  => {
	const email = sessionCall.message.args.email

	try {
		const confirmationCode = await sendConfirmationLetter({ email, url: 'settings', type: 'notif-confirmation' })
		confirmationCode && await setConfirmationCode(sessionCall, confirmationCode)
	} catch (err) {
    log.error("Error", err)
  }
  
}

export const sendFaucetConfirmationLetter = async ({ email, account }: FaucetFormData)  => {
	try {
		const confirmationCode = await sendConfirmationLetter({ email, url: `faucet/drop`, args: { account }, type: 'faucet-confirmation' })
		return confirmationCode
	} catch (err) {
		log.error("Error", err)
		return undefined
  }
}