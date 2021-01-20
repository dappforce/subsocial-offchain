import { sendEmail } from './emailSender';
import { v4 } from 'uuid'
import { appsUrl, subsocialLogo } from '../../env';
import { setConfirmationCode } from '../../postgres/updates/setConfirmationCode';
import { SessionCall, ConfirmLetter } from '../../postgres/types/sessionKey';
import { ConfirmationLink } from './types';
import { newLogger } from '@subsocial/utils';

type SendConfirmationLetterParams = {
	email: string,
	type: 'faucet-confirmation' | 'notif-confirmation',
	redirect: string
}

const log = newLogger(sendConfirmationLetter.name)

export async function sendConfirmationLetter ({ email, redirect, type }: SendConfirmationLetterParams) {
	const confirmationCode = v4()

	const data: ConfirmationLink = {
		link: `${appsUrl}?confirmationCode=${confirmationCode}&next=${redirect}`,
		image: subsocialLogo
	}

	console.log(data)

	try {
		await sendEmail(email, data, type)
		return confirmationCode
	} catch (err) {
		// TODO: replace with logger created by newLogger
		log.error("Failed send confirmation:", err)
		return undefined
  }
  
}

export const sendNotifConfirmationLetter = async (sessionCall: SessionCall<ConfirmLetter>)  => {
	const email = sessionCall.message.args.email

	try {
		const confirmationCode = await sendConfirmationLetter({ email, redirect: 'settings', type: 'notif-confirmation' })
		confirmationCode && await setConfirmationCode(sessionCall, confirmationCode)
	} catch (err) {
		// TODO: replace with logger created by newLogger
    console.log("Error", err)
  }
  
}

export const sendFaucetConfirmationLetter = async (email: string)  => {
	try {
		const confirmationCode = await sendConfirmationLetter({ email, redirect: 'faucet/drop-tokens', type: 'faucet-confirmation' })
		return confirmationCode
	} catch (err) {
		// TODO: replace with logger created by newLogger
		console.log("Error", err)
		return undefined
  }
  
}