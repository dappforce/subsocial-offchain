import { createTransport, getTestMessageUrl } from 'nodemailer'
import { emailHost, emailPort, emailUser, emailPassword } from '../../env';
import { newLogger } from '@subsocial/utils';
import { ActivityType } from './utils';

const log = newLogger('Email')

export const sendEmail = async (email: string, message: string, type: ActivityType) => {
	const transporter = createTransport({
		host: emailHost,
		port: parseInt(emailPort),
		secure: true, auth: {
			user: emailUser,
			pass: emailPassword,
		},
	});

	const info = await transporter.sendMail({
		from: emailUser,
		to: email,
		subject: `New ${type}`,
		html: message
	})
	log.debug("Message sent: %s", info.messageId);

	log.debug("Preview URL: %s", getTestMessageUrl(info));
}
