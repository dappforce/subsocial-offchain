import { Keyring } from '@polkadot/api';
import { faucetSeed } from '../../env';

function enableFaucet() {
	const keyring = new Keyring({ type: 'sr25519' });
	const sudo = keyring.addFromAddress(faucetSeed, { name: 'Faucet' });
	return sudo;
}

const faucetPair = enableFaucet()
export const faucetPublicKey = faucetPair.publicKey.toString()

export async function transferToken () {
  return true
}