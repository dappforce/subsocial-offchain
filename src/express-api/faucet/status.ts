import { Option } from "@polkadot/types"
import { BlockNumber } from "@polkadot/types/interfaces"
import { Faucet } from "@subsocial/types/substrate/interfaces"
import { resolveSubsocialApi } from "../../connections"
import { faucetAmount } from "../../env"
import { OkOrError } from "../utils"
import { getFaucetPublicKey } from "./faucetPair"

import dayjs from "dayjs"
import relativeTime from 'dayjs/plugin/relativeTime'
import BN from "bn.js"
dayjs.extend(relativeTime)

const errors = { faucet: 'FaucetDisabled' } as Record<string, any>

const BLOCK_TIME = 6 * 1000

const calculateComeBackTime = (nextPeriodAt: BlockNumber, currentBlock: BN) => {
  const toSeconds = nextPeriodAt.sub(currentBlock).muln(BLOCK_TIME).toNumber()
  const to = dayjs().add(toSeconds).add(1, 'hours')
  console.log('toSeconds', toSeconds)

  return dayjs().to(to)
}

export const checkFaucetIsActive = async (): Promise<OkOrError<null>> => {
  const failedRes = { ok: false, errors }
  if (faucetAmount === 0) return failedRes

  const faucetAddress = getFaucetPublicKey()

  const { api } = await resolveSubsocialApi()

  const { freeBalance } = await api.derive.balances.all(faucetAddress)
  
  if (freeBalance.ltn(faucetAmount)) return failedRes

  const faucetOpt = await api.query.faucets.faucetByAccount(getFaucetPublicKey()) as Option<Faucet>

  if (faucetOpt.isNone) return failedRes

  const { period_limit, dripped_in_current_period, drip_limit, next_period_at, enabled } = faucetOpt.unwrap()

  if (!enabled) return failedRes

  if (drip_limit.ltn(faucetAmount)) return failedRes

  const tokensLeftInCurrentPeriod = period_limit.sub(dripped_in_current_period)

  const lastBlock = await api.rpc.chain.getBlock()
  const currentBlock = lastBlock.block.header.number.toBn().addn(1)

  if (tokensLeftInCurrentPeriod.ltn(faucetAmount)) return {
    ok: false,
    errors: {
      faucet: {
        status: 'PeriodLimitReached',
        data: calculateComeBackTime(next_period_at, currentBlock)
      }
    }
  }

  return {
    ok: true
  }
}