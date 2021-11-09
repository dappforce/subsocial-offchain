import { newPgError, runQuery, upsertNonce } from '../utils'
import { getApi } from '@subsocial/api'
import { equalAddresses } from '../../utils'
import { SessionCall } from '../types/sessionKey'
import { updateNonce } from '../updates/updateNonce'

export type Contribution = {
  refCode: string
  blockHash: string
}

const query = `
  INSERT INTO df.referral_contributions(block_number, event_index, contributor, ref_code, amount, date)
  VALUES(:blockNumber, :eventIndex, :contributor, :refCode, :amount, :date)
  RETURNING *`

const SUBSOCIAL_PARA_ID = 2000

const getKusamaApi = () => getApi('wss://staging.subsocial.network/kusama')

export async function insertContribution({ message, account }: SessionCall<Contribution>) {
  const { refCode, blockHash } = message.args
  const { rootAddress: contributor, nonce } = await upsertNonce(account, message)

  console.log('message.nonce !== nonce', message.nonce, nonce)
  
  if (message.nonce != nonce) {
    throw 'Nonce is different'
  }

  const kusamaApi = await getKusamaApi()

  const events = await kusamaApi.query.system.events.at(blockHash)

  let eventData: any[] = undefined
  let eventIndex = 0

  events.forEach(({ event: { method, section, data }}, i) => {
    if (section === 'crowdloan'
      && method === 'Contributed'
      && equalAddresses(data[0].toString(), contributor)
    ){
      eventData = data
      eventIndex = i
    }
  })

  console.log('event', JSON.stringify(eventData), eventIndex)

  if (!eventData) return

  const paraId = eventData[1]
  const amount = eventData[2].toString()

  if(contributor === refCode) {
    throw `Contributor and referral code are equal ${refCode}`
  }

  if (paraId.toNumber() !== SUBSOCIAL_PARA_ID) {
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
    updateNonce(account, nonce + 1)
  } catch (err) {
    throw newPgError(err, insertContribution)
  }
}
