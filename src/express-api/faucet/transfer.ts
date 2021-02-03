import { Keyring } from '@polkadot/api';
import { GenericAccountId } from '@polkadot/types';
import registry from '@subsocial/types/substrate/registry';
import { resolveSubsocialApi } from '../../connections';
import { faucetAmount, faucetSeed } from '../../env';
import { createTestKeyring } from '@polkadot/keyring/testing'
import { newLogger } from '@subsocial/utils';

let keyring: Keyring

const log = newLogger(transferToken.name)

function enableFaucet() {
	// keyring = new Keyring({ type: 'sr25519' });
	keyring = createTestKeyring() as Keyring
	// const faucet = keyring.addFromAddress(faucetSeed, { name: 'Faucet' });
	return keyring.getPair(faucetSeed);
}

const faucetPair = enableFaucet()

export let faucetPublicKey: string
export const getFaucetPublicKey = () => {
	if (!faucetPublicKey) {
		faucetPublicKey = new GenericAccountId(registry, faucetPair.publicKey).toString()
	}
	
	return faucetPublicKey
}

export async function transferToken (toAddress: string, insertToDb: (blockNumber: BigInt, eventIndex: number) => void) {
	const { api } = await resolveSubsocialApi()

	const transfer = api.tx.balances.transfer(toAddress, faucetAmount * 10 ** 12);
	const faucetPublicKey = getFaucetPublicKey()

	// Find the actual keypair in the keyring
	const faucetPair = keyring.getPair(faucetPublicKey)

	const unsub = await transfer.signAndSend(faucetPair, ({ events = [], status }) => {
		log.debug('Transaction status:', status.type);
  
		if (status.isInBlock) {
      const blockHash = status.asInBlock.toHex()
		  log.debug('Included at block hash', blockHash);
  
			events.forEach(({ event: { method } }, eventIndex) => {

        if (method === 'Transfer') { // TODO: replace on 'TokenDrop' event
          api.rpc.chain.getBlock(blockHash).then(({ block: { header: { number }} }) => {
            insertToDb(BigInt(number.toString()), eventIndex)
          })
				}
			});
		} else if (status.isFinalized) {
		  log.debug('Finalized block hash', status.asFinalized.toHex());
		  unsub()
		}
    });

}