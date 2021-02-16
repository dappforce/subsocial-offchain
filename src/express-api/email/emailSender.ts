import { createTransport, getTestMessageUrl } from 'nodemailer'
import { emailHost, emailPort, emailUser, emailPassword, appsUrl, emailFrom } from '../../env';
import { newLogger } from '@subsocial/utils';
import { ActivityType } from './utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import { compile, registerHelper } from 'handlebars';
import { NotificationTemplateProp, ConfirmationProp, FeedTemplateProp } from './types';

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

export const sendEmail = async (email: string, data: DataTemplateProp, type: ActivityType) => {
	const source = readFileSync(join(__dirname, `templates/${type}/html.hbs`), 'utf8');

	// TODO Do not compile every time
	const template = compile(source)

	const info = await transporter.sendMail({
		from: emailFrom,
		to: email,
		subject: `New ${type}`,
		html: template({ data, appsUrl })
	})

	log.debug("Message sent:", info.messageId);
	log.debug("Preview URL:", getTestMessageUrl(info));
}
