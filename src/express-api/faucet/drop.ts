import { GenericAccountId } from '@polkadot/types/generic';
import { registry } from '@subsocial/types/substrate/registry';
import { insertTokenDrop } from '../../postgres/inserts/insertTokenDrop';
import { getConfirmationData } from '../../postgres/selects/getConfirmationCode';
import { setConfirmationDate } from '../../postgres/updates/setConfirmationDate';
import { OkOrError } from '../utils';
import { checkWasTokenDrop } from './check';
import { getFaucetPublicKey } from './faucetPair';
import { BaseConfirmData, FaucetFormData } from "./types";
import { resolveSubsocialApi } from '../../connections';
import { newLogger } from '@subsocial/utils';
import { faucetPair } from './faucetPair';
import { getFaucetDripAmount } from './utils';
import BN from 'bn.js';

const log = newLogger(dropTx.name)

export async function dropTx (toAddress: string, insertToDb: (blockNumber: BigInt, eventIndex: number, amount: BN) => void) {
	const { api } = await resolveSubsocialApi()

  const { freeBalance } = await api.derive.balances.all(toAddress)
  const faucetDripAmount = getFaucetDripAmount()

  const tokenDifference = faucetDripAmount.sub(freeBalance)

	const drip = api.tx.faucets.drip(toAddress, tokenDifference);

	const unsub = await drip.signAndSend(faucetPair, ({ events = [], status }) => {
		log.debug('Transaction status:', status.type);

		if (status.isInBlock) {
      const blockHash = status.asInBlock.toHex()
		  log.debug('Included at block hash', blockHash);

			events.forEach(({ event: { method } }, eventIndex) => {

        if (method === 'Transfer') { // TODO: replace on 'TokenDrop' event
          api.rpc.chain.getBlock(blockHash).then(({ block: { header: { number }} }) => {
            insertToDb(BigInt(number.toString()), eventIndex, tokenDifference)
          })
				}
			});
		} else if (status.isFinalized) {
		  log.debug('Finalized block hash', status.asFinalized.toHex());
		  unsub()
		}
    });

}

export const tokenDrop = async ({ account, email }: Omit<FaucetFormData, 'token'>): Promise<OkOrError> => {
  const { ok: noTokenDrop, errors } = await checkWasTokenDrop({ account, email })

  if (!noTokenDrop) return { ok: false, errors }

  await dropTx(account,
    (block_number, event_index, amount) => insertTokenDrop({
      block_number,
      event_index,
      faucet: getFaucetPublicKey(),
      account,
      amount: amount.toNumber(),
      email,
      captcha_solved: true
    }))

  return { ok: true }
}

export const confirmAndTokenDrop = async ({ account: clientSideAccount, confirmationCode }: BaseConfirmData): Promise<OkOrError> => {
  const account = new GenericAccountId(registry, clientSideAccount).toString()
  try {
    const { original_email: email } = await getConfirmationData(account)
    const { ok, errors } = await setConfirmationDate({ account, confirmationCode })

    if (ok) {
     return tokenDrop({ account, email })
    } else {
      throw errors
    }

  } catch (err) {
    return { ok: false, errors: err?.stack || err }
  }

}