import { newPgError, runQuery } from '../utils'
import BN from 'bn.js'
import { log } from '../postges-logger'

export type Contribution = {
  contributor: string
  refCode: string
  amount: BN
}

const query = `
  INSERT INTO df.referral_contributions(contributor, ref_code, amount, date)
  VALUES(:contributor, :refCode, :amount, :date)
  ON CONFLICT (contributor, ref_code) DO UPDATE
  SET amount = df.referral_contributions.amount + :amount
  RETURNING *`

export async function insertContribution(data: Contribution) {
  const { contributor, refCode, amount } = data

  if(contributor === refCode) {
    log.warn('Contributor and referral code are equal', refCode)
    return
  }

  const params = {
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
