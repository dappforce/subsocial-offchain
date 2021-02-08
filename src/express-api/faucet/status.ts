import { resolveSubsocialApi } from "../../connections"
import { OkOrError } from "../utils"

const ONE = BigInt(1)

export const checkFaucetIsActive = async (): Promise<OkOrError<null>> => {
  const { api } = await resolveSubsocialApi()

  const lastBlock = await api.rpc.chain.getBlock()
  const currentBlock = lastBlock.block.header.number.toBigInt() + ONE

  const { next_period_at, total_dropped, period_limit } = {
    next_period_at: 1000000, total_dropped: 500, period_limit: 5
  }// await api.query.faucets.

  if (currentBlock < next_period_at && total_dropped > period_limit) {
    return {
      ok: false,
      errors: { status: 'The faucet is temporarily disabled.' }
    }
  }

  return {
    ok: true
  }
}