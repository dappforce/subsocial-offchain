import { exit } from 'process'
import { pg } from '../connections/postgres'
import { postgesLog as log } from '../connections/loggers'
import { nonEmptyArr } from '@subsocial/utils'
import { readFileSync, readdirSync } from 'fs'
import { QueryResultRow } from 'pg'

const RELATION_NOT_FOUND_ERROR = '42P01'
const updateSchemaVersionQuery = 'UPDATE df.schema_version SET value = $1 WHERE value = $2'

export const INIT_FILE = readFileSync(`${__dirname}/1-init.sql`, 'utf8')

export enum MigrationStatus {
  NewMigrationsExecuted = 'New migrations were successfuly executed',
  NoNewMigrations = 'No new migrations for the current database schema',
  SchemaRestored = 'Schema was restored from 1-init',
}

const stripSchemaVersion = (fileName: string) => parseInt(fileName.split('-')[0])

export const getMigrationStatus = async (): Promise<MigrationStatus> => {
  try {
    const { rows } = await pg.query('SELECT * FROM df.schema_version LIMIT 1')
    if (nonEmptyArr<QueryResultRow>(rows)) {
      const schemaFiles = readdirSync(__dirname, 'utf8').filter((fileName) => fileName.endsWith('.sql'))
      const maxAvailableSchemaVersion = schemaFiles.map(stripSchemaVersion).pop()

      const actualSchemaVersion = rows[0].value as number
      if (actualSchemaVersion && actualSchemaVersion == maxAvailableSchemaVersion) {
        return MigrationStatus.NoNewMigrations
      } else {
        const migrationsToExecute = schemaFiles.filter((fileName) => stripSchemaVersion(fileName) > actualSchemaVersion)

        for (const fileName of migrationsToExecute) {
          const fileQuery = readFileSync(`${__dirname}/${fileName}`, 'utf8')
          await pg.query(fileQuery)

          const schemaVersion = stripSchemaVersion(fileName)
          // TODO: update to query params, when branches are merged
          await pg.query(updateSchemaVersionQuery, [schemaVersion, actualSchemaVersion])
        }

        return MigrationStatus.NewMigrationsExecuted
      }
    } else {
      return MigrationStatus.SchemaRestored
    }
  } catch (error) {
    if (error.code === RELATION_NOT_FOUND_ERROR) {
      return MigrationStatus.SchemaRestored
    } else {
      log.error('Undefined', error)
      exit()
    }
  }
}
