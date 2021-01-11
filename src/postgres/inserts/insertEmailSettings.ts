import { runQuery, isValidSignature } from '../utils';
import { log } from '../postges-logger'
import { SessionCall, SetUpEmailArgs } from '../types/sessionKey';
import { getNonce } from '../selects/getNonce';
import { insertNonce } from './insertNonce';
import { getFromSessionKey as getAccountFromSessionKey } from '../selects/getAccountBySessionKey';

const query = `
  INSERT INTO df.email_settings (account, email, recurrence, send_feeds, send_notifs)
  VALUES(:account, :email, :recurrence, :send_feeds, :send_notifs)
  ON CONFLICT (account, email) DO UPDATE
  SET email = :email,
	recurrence = :recurrence,
	send_feeds = :send_feeds,
	send_notifs = :send_notifs`

export const setEmailSettings = async (sessionCall: SessionCall<SetUpEmailArgs>) => {
	const { account, signature, message } = sessionCall
	const { email, recurrence, send_feeds, send_notifs } = message.args

	let mainKey = await getAccountFromSessionKey(account)
	if (!mainKey) {
		log.error(`There is no account that owns this session key: ${account}`)
		mainKey = account
	}
	let selectedNonce = await getNonce(account)

	if (!selectedNonce) {
		await insertNonce(account, message.nonce)
		selectedNonce = 0
	}
	if (parseInt(selectedNonce.toString()) === message.nonce) {
		const isValid = isValidSignature({ account, signature, message } as SessionCall<SetUpEmailArgs>)
		if (!isValid) {
			log.error("Signature is not valid: function setEmailSettings ")
			return
		}

		log.debug(`Signature verified`)
		try {
			await runQuery(query, { account: mainKey, email, recurrence, send_feeds, send_notifs })
			log.debug(`Insert email settings in database: ${mainKey}`)
		} catch (err) {
			log.error(`Failed to insert email settings for account: ${mainKey}`, err.stack)
			throw err
		}
	}
}
