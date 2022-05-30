import { postgesLog as log } from '../connections/loggers'
import { exit } from 'process'
import { readFileSync, readdirSync } from 'fs'
import { runQuery } from './utils'
import { getActualSchemaVersion } from './selects/getActualSchemaVersion'

const RELATION_NOT_FOUND_ERROR = '42P01'

const updateSchemaVersionQuery = 'UPDATE df.schema_version SET value = :newSchemaVersion WHERE value = :actualSchemaVersion'
const migrationsFolder = `${__dirname}/migrations/`
const schemaFiles = readdirSync(migrationsFolder, 'utf8').filter((fileName) => fileName.endsWith('.sql'))

const stripSchemaVersion = (fileName: string) => parseInt(fileName.split('-')[0])

const upgradeDbSchema = async (actualSchemaVersion: number) => {
  const migrationsToExecute = schemaFiles
    .map((fileName, index) => [stripSchemaVersion(fileName), index])
    .filter((version) => version[0] > actualSchemaVersion)
    .sort((a, b) => a[0] - b[0])

  for (const file of migrationsToExecute) {
    const fileName = schemaFiles[file[1]]
    const fileQuery = readFileSync(`${migrationsFolder}${fileName}`, 'utf8')
    await runQuery(fileQuery)

    const newSchemaVersion = stripSchemaVersion(fileName)

    const params = { newSchemaVersion, actualSchemaVersion }

    await runQuery(updateSchemaVersionQuery, params)
    actualSchemaVersion = newSchemaVersion
    log.info(`Updated database to schema version # ${newSchemaVersion}`)
  }
}

const init = async () => {
  try {
    const actualSchemaVersion = await getActualSchemaVersion()
    const maxAvailableSchemaVersion = schemaFiles
      .map(stripSchemaVersion)
      .sort((currentVersion, nextVersion) => currentVersion - nextVersion)
      .pop()


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
