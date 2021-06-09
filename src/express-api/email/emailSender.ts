import { createTransport, getTestMessageUrl } from 'nodemailer'
import { emailHost, emailPort, emailUser, emailPassword, appBaseUrl, emailFrom } from '../../env';
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

export const sendEmail = async ({ email, type, data, fromName = 'Subsocial', subject, title = subject }: SendEmailProps) => {

	const info = await transporter.sendMail({
		from: `${fromName} <${emailFrom}>`,
		to: email,
		subject,
		html: templates[type]({ data, appBaseUrl, title, [type]: true })
	})

	log.debug("Message sent:", info.messageId);
	log.debug("Preview URL:", getTestMessageUrl(info));
}
