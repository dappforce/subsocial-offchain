import { runQuery, isValidSignature, upsertNonce } from '../utils';
import { log } from '../postges-logger'
import { SessionCall, SetUpEmailArgs } from '../types/sessionKey';
import { updateNonce } from '../updates/updateNonce';

const query = `
  INSERT INTO df.email_settings (account, email, recurrence, send_feeds, send_notifs)
  VALUES(:account, :email, :recurrence, :send_feeds, :send_notifs)
  ON CONFLICT (account) DO UPDATE
  SET email = :email,
	recurrence = :recurrence,
	send_feeds = :send_feeds,
	send_notifs = :send_notifs`

export const addEmailSettings = async (sessionCall: SessionCall<SetUpEmailArgs>) => {
	const { account, signature, message } = sessionCall
	const { email, recurrence, send_feeds, send_notifs } = message.args

	const { nonce, rootAddress } = await upsertNonce(account, message)

	if (parseInt(nonce.toString()) === message.nonce) {
		const isValid = isValidSignature({ account, signature, message } as SessionCall<SetUpEmailArgs>)
		if (!isValid) {
			log.error("Signature is not valid: function setEmailSettings ")
			return
		}

		log.debug(`Signature verified`)
		try {
			await runQuery(query, { account: rootAddress, email, recurrence, send_feeds, send_notifs })
			await updateNonce(account, message.nonce + 1)
			log.debug(`Insert email settings in database: ${rootAddress}`)
		} catch (err) {
			log.error(`Failed to insert email settings for account: ${rootAddress}`, err.stack)
			throw err
		}
	}
}
