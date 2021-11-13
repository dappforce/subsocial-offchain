import { newPgError, runQuery, upsertNonce } from '../utils'
import { getApi } from '@subsocial/api'
import { equalAddresses } from '../../utils'
import { SessionCall } from '../types/sessionKey'
import { incNonce } from '../updates/updateNonce'
import { encodeAddress } from '@polkadot/util-crypto'
import {toSubsocialAddress} from "@subsocial/utils";
import {kusamaNodeUrl, subsocialParaId} from "../../env";

export type Contribution = {
  refCode: string
  blockHash: string
}

const query = `
  INSERT INTO df.referral_contributions(block_number, event_index, contributor, ref_code, amount, date)
  VALUES(:blockNumber, :eventIndex, :contributor, :refCode, :amount, :date)
  RETURNING *`

const parseEvents = (events, contributor: string) => {
  let refCode: string
  let eventData: any[] = undefined
  let eventIndex = 0

  events.forEach(({ event: { method, section, data }}, i) => {
    if (section === 'crowdloan'
        && equalAddresses(data[0].toString(), contributor)
    ){
      switch (method) {
        case 'Contributed': {
          eventData = data
          eventIndex = i
          break
        }
        case 'MemoUpdated': {
          refCode = toSubsocialAddress(encodeAddress(data[2].toString()))
        }
      }
    }
  })

  if (!eventData) return undefined

  const paraId = eventData[1]
  const amount = eventData[2].toString()

  return {
    paraId,
    amount,
    refCode,
    eventIndex
  }
}

const getKusamaApi = () => getApi(kusamaNodeUrl)

export async function insertContribution({ message, account }: SessionCall<Contribution>) {
  const { blockHash } = message.args
  const { rootAddress: contributor, nonce } = await upsertNonce(account, message)

  if (message.nonce != nonce) {
    throw 'Nonce is different'
  }

  const kusamaApi = await getKusamaApi()

  const events = await kusamaApi.query.system.events.at(blockHash)

  const parsedData = parseEvents(events, contributor)
  if (!parsedData) return

  const { refCode, paraId, amount, eventIndex } = parsedData

  if (!refCode) return

  if (paraId.toNumber() !== subsocialParaId) {
    throw 'The no Subsocial contribute'
  }

  const header = await kusamaApi.rpc.chain.getHeader(blockHash)

  const params = {
    blockNumber: header.number.toBigInt(),
    eventIndex,
    contributor,
    refCode,
    amount,
    date: new Date()
  }

  try {
    runQuery(query, params)
    incNonce(account, nonce)
  } catch (err) {
    throw newPgError(err, insertContribution)
  }
}
