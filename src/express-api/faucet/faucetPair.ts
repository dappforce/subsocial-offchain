import { faucetMnemonic } from '../../env';
import { Keyring } from '@polkadot/keyring'
import { isEmptyStr } from '@subsocial/utils';

export const keyring = new Keyring({ type: 'ed25519' })
function createFaucetPair() {
	// const faucet = keyring.addFromAddress(faucetSeed, { name: 'Faucet' });
	if (isEmptyStr(faucetMnemonic)) throw new Error('Faucet seed is not defained')
	return keyring.addFromMnemonic(faucetMnemonic, {}, 'ed25519')
}

export const faucetPair = createFaucetPair()

export const getFaucetPublicKey = () => faucetPair.address