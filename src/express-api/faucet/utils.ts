import { faucetDripAmount, faucetMaxAmountTopUp } from "../../env";
import BN from 'bn.js'
import { formatBalance } from '@polkadot/util'


const createAmountBn = (amount) => {
  let amountBn = new BN(0)

  return () => {
    if (amountBn.eqn(0)) {
      amountBn = new BN(amount * 10 ** formatBalance.getDefaults().decimals)
    }
  
    return amountBn
  }
}

export const getFaucetDripAmount = createAmountBn(faucetDripAmount)
export const getFaucetMaxAmountTopUp = createAmountBn(faucetMaxAmountTopUp)