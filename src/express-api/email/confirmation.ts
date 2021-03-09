import { LetterParams, sendEmail } from './emailSender';
import { v4 } from 'uuid'
import { appBaseUrl, subsocialLogo } from '../../env';
import { setConfirmationCode } from '../../postgres/updates/setConfirmationCode';
import { SessionCall, ConfirmLetter } from '../../postgres/types/sessionKey';
import { ConfirmationProp } from './types';
import { newLogger } from '@subsocial/utils';
import { FaucetFormData } from '../faucet/types';

type SendConfirmationLetterParams = LetterParams & {
	email: string,
	url: string,
	customTemplate?: Partial<ConfirmationProp>,
	args?: Record<string,string>
}

const confirmationMsgForSetting = `Now you need to confirm your email address by clicking the button below. After confirmation, you will be able
to receive notifications and feed updates depending on the settings on the Settings page.`

const confirmationMsg = `Now you need to confirm your email address by clicking the button below.`

const log = newLogger(sendConfirmationLetter.name)

export async function sendConfirmationLetter ({ email, url, args, customTemplate, ...params }: SendConfirmationLetterParams) {
	const confirmationCode = v4()

	const argsStr = args ? Object.entries(args).map(([ name, value ]) => `&${name}=${value}`).join() : ''

	const data: ConfirmationProp = Object.assign({
		link: `${appBaseUrl}/${url}?confirmationCode=${confirmationCode}${argsStr}`, // TODO: use getFullUrl ?
		image: subsocialLogo,
		message: confirmationMsg,
		buttonText: 'Confirm email'
	}, customTemplate)

	try {
		await sendEmail({ email, data, type: 'confirmation', ...params })
		return confirmationCode
	} catch (err) {
		log.error("Failed send confirmation:", err)
		return undefined
  }
  
}

export const sendNotifConfirmationLetter = async (sessionCall: SessionCall<ConfirmLetter>)  => {
	const email = sessionCall.message.args.email

	try {
		const confirmationCode = await sendConfirmationLetter({
			subject: 'Confirm your email',
			email, url: 'settings/email/confirm-email',
			customTemplate: { message: confirmationMsgForSetting },
		})
		confirmationCode && await setConfirmationCode(sessionCall, confirmationCode)
	} catch (err) {
    log.error("Error", err)
  }
}

export const sendFaucetConfirmationLetter = async ({ email, account }: FaucetFormData)  => {
	try {
		const confirmationCode = await sendConfirmationLetter({
			email,
			subject: 'Claim your tokens',
			url: `faucet/drop`,
			args: { account },
			customTemplate: { buttonText: 'Claim tokens' }
		})
		return confirmationCode
	} catch (err) {
		log.error("Error", err)
		return undefined
  }
}