import { faucetDripAmount } from "../../env";
import BN from 'bn.js'
import { formatBalance } from '@polkadot/util'

let faucetDripAmountBN = new BN(0)

export const getFaucetDripAmount = () => {
  if (faucetDripAmountBN.eqn(0)) {
    faucetDripAmountBN = new BN(faucetDripAmount * 10 ** formatBalance.getDefaults().decimals)
  }

  return faucetDripAmountBN
}