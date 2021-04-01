import { createTransport, getTestMessageUrl } from 'nodemailer'
import { emailHost, emailPort, emailUser, emailPassword, appsUrl, emailFrom, PAUSE_BETWEEN_EMAILS_IN_MILLIS } from '../../env';
import { newLogger } from '@subsocial/utils';
import { registerHelper } from 'handlebars';
import { NotificationTemplateProp, ConfirmationProp, FeedTemplateProp } from './types';
import templates, { TemplateType } from './templates';

const log = newLogger('Email Sender')

type DataTemplateProp = NotificationTemplateProp[] | FeedTemplateProp[] | ConfirmationProp

const transporter = createTransport({
	host: emailHost,
	port: emailPort,
	secure: true,
	auth: {
		user: emailUser,
		pass: emailPassword,
	},
});

registerHelper('notEq', function (v1, v2, options) {
	if (v1 !== v2) {
		return options.fn(this);
	}
	return options.inverse(this);
});

export type LetterParams = {
	fromName?: string,
	subject: string,
	title?: string
}

type SendEmailProps = LetterParams & {
	email: string,
	data: DataTemplateProp,
	type: TemplateType,
}

// true if busy sending queued emails
let isBusy = false

const emailReqs: SendEmailProps[] = []

export const sendEmail = async (req: SendEmailProps) => {
	emailReqs.push(req)

	if (!isBusy) {
		isBusy = true
		sendNextEmail()
	}
}

const sendNextEmail = async () => {
	if (!emailReqs.length) return
	
	const req = emailReqs.shift()
	await doSendEmail(req)

	if (emailReqs.length) {
		setTimeout(sendNextEmail, PAUSE_BETWEEN_EMAILS_IN_MILLIS)
	} else {
		isBusy = false
	}
}

const doSendEmail = async (req: SendEmailProps) => {
	const { email, type, data, fromName = 'Subsocial', subject, title = subject } = req

	const info = await transporter.sendMail({
		from: `${fromName} <${emailFrom}>`,
		to: email,
		subject,
		html: templates[type]({ data, appsUrl, title, [type]: true })
	})

	log.debug("Message sent:", info.messageId)
	log.debug("Preview URL:", getTestMessageUrl(info))
}
