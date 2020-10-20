import { newLogger } from "@subsocial/utils"
import { pg } from '../../connections/connect-postgres'

const log = newLogger('PgQuery')

export const getQuery = async (
  query: string,
  params: any[],
  errorMsg: string
): Promise<any> => {
  try {
    const data = await pg.query(query, params)
    return data.rows
  } catch (err) {
    log.error(errorMsg, err.stack);
    throw err.stack
  }
}
