import { sendEmail } from './emailSender';
import { v4 } from 'uuid'
import { appsUrl, ipfsNodeUrl } from '../../env';
import { setConfirmationCode } from '../../postgres/updates/setConfirmationCode';
import { SessionCall, ConfirmLetter } from '../../postgres/types/sessionKey';
import { ConfirmationLink } from './types';

export const sendConfirmationLetter = async (email: string) => {
	const confirmationCode = v4()

	// TODO: replace hard-code
	let imageLink = `${ipfsNodeUrl}/ipfs/QmYnF6YpRvvXETzCmVVc3PBziig7sgra6QmtqKEoCngm2C`
	const link: ConfirmationLink = {
		link: `${appsUrl}/settings?confirmationCode=${confirmationCode}`,
		image: imageLink
	}

	try {
    await sendEmail(email, link, "confirmation")
    return confirmationCode
	} catch (err) {
		// TODO: replace with logger created by newLogger
    console.log("Error", err)
    return undefined
  }
  
}

export const confirmationEmailForSettings = async (sessionCall: SessionCall<ConfirmLetter>) => {
	const email = sessionCall.message.args.email

	try {
		const confirmationCode = await sendConfirmationLetter(email)
		await setConfirmationCode(sessionCall, confirmationCode)
	} catch (err) {
		// TODO: replace with logger created by newLogger
		console.log("Error", err)
	}
}