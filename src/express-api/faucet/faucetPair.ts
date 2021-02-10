import { faucetMnemonic } from '../../env';
import { Keyring } from '@polkadot/keyring'
import { isEmptyStr, newLogger } from '@subsocial/utils';

const log = newLogger(createFaucetPair.name)
export const keyring = new Keyring({ type: 'ed25519' })

function createFaucetPair() {
	// const faucet = keyring.addFromAddress(faucetSeed, { name: 'Faucet' });
	if (!faucetMnemonic || isEmptyStr(faucetMnemonic)) {
		log.error('Faucet mnemonic is not defined')
		return undefined
	}
	return keyring.addFromMnemonic(faucetMnemonic, {}, 'ed25519')
}

export const faucetPair = createFaucetPair()

export const getFaucetPublicKey = () => faucetPair.address