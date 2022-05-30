import { runQuery } from "../utils"

export const getActualSchemaVersion = async () => {
  const { rows } = await runQuery('SELECT * FROM df.schema_version LIMIT 1')

  return rows[0]?.value as number || 0
}