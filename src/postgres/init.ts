import { pg } from '../connections/postgres'
import { postgesLog as log } from '../connections/loggers'
import { exit } from 'process'
import { readFileSync, readdirSync } from 'fs'

const RELATION_NOT_FOUND_ERROR = '42P01'

const updateSchemaVersionQuery = 'UPDATE df.schema_version SET value = $1 WHERE value = $2'
const migrationsFolder = `${__dirname}/migrations/`
const schemaFiles = readdirSync(migrationsFolder, 'utf8').filter((fileName) => fileName.endsWith('.sql'))

const stripSchemaVersion = (fileName: string) => parseInt(fileName.split('-')[0])

const upgradeDbSchema = async (actualSchemaVersion: number) => {
  const migrationsToExecute = schemaFiles.filter((fileName) => stripSchemaVersion(fileName) > actualSchemaVersion)

  for (const fileName of migrationsToExecute) {
    const fileQuery = readFileSync(`${migrationsFolder}${fileName}`, 'utf8')
    await pg.query(fileQuery)

    const newSchemaVersion = stripSchemaVersion(fileName)
    // TODO: update to query params, when branches are merged
    await pg.query(updateSchemaVersionQuery, [newSchemaVersion, actualSchemaVersion])
    actualSchemaVersion = newSchemaVersion
    log.info(`Updated database to schema version # ${newSchemaVersion}`)
  }
}

const init = async () => {
  try {
    const { rows } = await pg.query('SELECT * FROM df.schema_version LIMIT 1')
    const maxAvailableSchemaVersion = schemaFiles.map(stripSchemaVersion).pop()

    const actualSchemaVersion = rows[0]?.value as number || 0
    if (!actualSchemaVersion || actualSchemaVersion < maxAvailableSchemaVersion) {
      return upgradeDbSchema(actualSchemaVersion)
    }
  } catch (error) {
    if (error.code === RELATION_NOT_FOUND_ERROR) {
      return upgradeDbSchema(0)
    } else {
      log.error('Unexpected error: ', error)
      exit()
    }
  }
}

init()
