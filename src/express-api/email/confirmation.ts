import { sendEmail } from './emailSender';
import { v4 } from 'uuid'
import { appsUrl, subsocialLogo } from '../../env';
import { setConfirmationCode } from '../../postgres/updates/setConfirmationCode';
import { SessionCall, ConfirmLetter } from '../../postgres/types/sessionKey';
import { ConfirmationLink } from './types';

export const sendNotifConfirmationLetter = async (sessionCall: SessionCall<ConfirmLetter>)  => {
	const email = sessionCall.message.args.email
	const confirmationCode = v4()

	// TODO: replace hard-code
	const link: ConfirmationLink = {
		link: `${appsUrl}/settings?confirmationCode=${confirmationCode}`,
		image: subsocialLogo
	}

	try {
		await sendEmail(email, link, 'notif-confirmation')
		await setConfirmationCode(sessionCall, confirmationCode)
	} catch (err) {
		// TODO: replace with logger created by newLogger
    console.log("Error", err)
  }
  
}

export const sendFaucetConfirmationLetter = async (email: string)  => {
	const confirmationCode = v4()

	// TODO: replace hard-code
	const link: ConfirmationLink = {
		link: `localhost:3001/faucet/claim-token?confirmationCode=${confirmationCode}`, //TODO: add env for host
		image: subsocialLogo
	}

	try {
		await sendEmail(email, link, 'faucet-confirmation')
	} catch (err) {
		// TODO: replace with logger created by newLogger
    console.log("Error", err)
  }
  
}