import { Option } from "@polkadot/types"
import { BlockNumber } from "@polkadot/types/interfaces"
import { Faucet } from "@subsocial/types/substrate/interfaces"
import { resolveSubsocialApi } from "../../connections"
import { OkOrError } from "../utils"
import { getFaucetPublicKey } from "./faucetPair"

import dayjs from "dayjs"
import relativeTime from 'dayjs/plugin/relativeTime'
import BN from "bn.js"
import { newLogger } from "@subsocial/utils"
import { getFaucetDripAmount, getFaucetMaxAmountTopUp } from "./utils"
dayjs.extend(relativeTime)

const errors = { faucet: 'FaucetDisabled' } as Record<string, any>

const BLOCK_TIME = 6 * 1000

const calculateComeBackTime = (nextPeriodAt: BlockNumber, currentBlock: BN) => {
  const toSeconds = nextPeriodAt.sub(currentBlock).muln(BLOCK_TIME).toNumber()
  const to = dayjs().add(toSeconds).add(1, 'hours')

  return dayjs().to(to)
}

const log = newLogger('Drop tokens')

export const checkFaucetIsActive = async (account?: string): Promise<OkOrError<null>> => {
  const faucetDripAmount = getFaucetDripAmount()
  
  const failedRes = { ok: false, errors }
  if (faucetDripAmount.eqn(0)) {
    log.warn('Faucet drip amount is equal zero')
    return failedRes
  }

  const faucetAddress = getFaucetPublicKey()

  const { api } = await resolveSubsocialApi()

  const { freeBalance } = await api.derive.balances.all(faucetAddress)
  
  if (freeBalance.lt(faucetDripAmount)) {
    log.warn('Free balance on the faucet account is less than the faucet drip amount')
    return failedRes
  }

  const faucetOpt = await api.query.faucets.faucetByAccount(getFaucetPublicKey()) as Option<Faucet>

  if (faucetOpt.isNone) {
    log.warn('Faucet info is none')
    return failedRes
  }


  const { period_limit, dripped_in_current_period, drip_limit, next_period_at, enabled } = faucetOpt.unwrap()

  if (!enabled) {
    log.warn('Faucet is disabled')
    return failedRes
  }

  if (drip_limit.lt(faucetDripAmount)) {
    log.warn('Drip limmit is less than faucet drip amount')
    return failedRes
  }

  const tokensLeftInCurrentPeriod = period_limit.sub(dripped_in_current_period)

  const lastBlock = await api.rpc.chain.getBlock()
  const currentBlock = lastBlock.block.header.number.toBn().addn(1)
  
  if (tokensLeftInCurrentPeriod.lt(faucetDripAmount)) {
    log.warn('Tokens left in current period is less than faucet drip amount')
    return {
      ok: false,
      errors: {
        faucet: {
          status: 'PeriodLimitReached',
          data: calculateComeBackTime(next_period_at, currentBlock)
        }
      }
    }
  }

  if (account) {
    const { freeBalance } = await api.derive.balances.all(account)
    const faucetMaxAmountTopUp = getFaucetMaxAmountTopUp()

    if (freeBalance.gte(faucetMaxAmountTopUp)) {
      return {
        ok: false,
        errors: {
          faucet: {
            status: 'ThereAreTokensYet',
            data: faucetMaxAmountTopUp.toString(),
          }
        }
      }
    }
  }


  return {
    ok: true
  }
}