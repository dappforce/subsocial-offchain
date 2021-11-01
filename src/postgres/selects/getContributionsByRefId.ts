import { runQuery } from '../utils'
import { log } from '../postges-logger'

const query = `
  SELECT * FROM df.referral_contributions
  WHERE ref_code = :refCode`

export const getContributionsByRefId = async (refCode: string) => {
  try {
    const data = await runQuery(query, { refCode })

    return data.rows || {}
  } catch (err) {
    log.error(`Failed to get contributions by referral code: ${refCode}`, err.stack)
    throw err
  }
}
