import { createTransport, getTestMessageUrl } from 'nodemailer'
import { emailHost, emailPort, emailUser, emailPassword, appsUrl, emailFrom } from '../../env';
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

type SendEmailProps = {
	email: string,
	data: DataTemplateProp,
	type: TemplateType,
	title?: string
}

export const sendEmail = async ({ email, type, data, title: customTitle }: SendEmailProps) => {

	const title = customTitle || type.charAt(0).toUpperCase() + type.slice(1)

	const info = await transporter.sendMail({
		from: emailFrom,
		to: email,
		subject: title,
		html: templates[type]({ data, appsUrl, title, [type]: true })
	})

	log.debug("Message sent:", info.messageId);
	log.debug("Preview URL:", getTestMessageUrl(info));
}
