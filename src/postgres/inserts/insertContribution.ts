import { newPgError, runQuery } from '../utils'
import { log } from '../postges-logger'
import { getApi } from '@subsocial/api'
import { equalAddresses } from '../../utils'

export type Contribution = {
  contributor: string
  refCode: string
  blockHash: string
  eventIndex: string
}

const query = `
  INSERT INTO df.referral_contributions(block_number, event_index, contributor, ref_code, amount, date)
  VALUES(:blockNumber, :eventIndex, :contributor, :refCode, :amount, :date)
  ON CONFLICT (contributor, ref_code) DO UPDATE
  SET amount = df.referral_contributions.amount + :amount
  RETURNING *`

const SUBSOCIAL_PARA_ID = 2000

const getKusamaApi = () => getApi('wss://staging.subsocial.network/kusama')

export async function insertContribution(data: Contribution) {
  const { contributor, refCode, blockHash, eventIndex } = data
  console.log('{ contributor, refCode, blockHash, eventIndex }', { contributor, refCode, blockHash, eventIndex })
  const kusamaApi = await getKusamaApi()

  const events = await kusamaApi.query.system.events.at(blockHash)

  const event = events[eventIndex]

  if (!event) return

  const [ account, paraId, amount ] = event.data
  
  if(contributor === refCode) {
    log.warn('Contributor and referral code are equal', refCode)
    return
  }

  if (paraId.toNumber() !== SUBSOCIAL_PARA_ID) {
    log.warn('The no Subsocial contribute', refCode)
    return
  }

  if (equalAddresses(account, contributor)) {
    log.warn('Incorrect contributor', contributor)
    return
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
    await runQuery(query, params)
  } catch (err) {
    throw newPgError(err, insertContribution)
  }
}
