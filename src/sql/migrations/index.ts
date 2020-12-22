import { exit } from 'process'
import { pg } from '../../connections/postgres'
import { postgesLog as log } from '../../connections/loggers'
import { isEmptyArray } from '@subsocial/utils'
import { readFileSync, readdirSync } from 'fs'

const RELATION_NOT_FOUND_ERROR = '42P01'
const updateSchemaVersionQuery = 'UPDATE df.schema_version SET value = $1 WHERE value = $2'

export const INIT_FILE = readFileSync(`${__dirname}/1-init.sql`, 'utf8')

export enum MigrationStatus {
  NewMigrationsExecuted = "New migrations were successfuly executed",
  NoNewMigrations = "No new migrations for the current database schema",
  SchemaRestored = "Schema was restored from 1-init",
}

const stripSchemaVersion = (fileName: string) => parseInt(fileName.split('-')[0])

export const getMigrationStatus = async (): Promise<MigrationStatus> => {
  try {
    const { rows } = await pg.query('SELECT * FROM df.schema_version LIMIT 1')
    if (!isEmptyArray(rows)) {
      const schemaFiles = readdirSync(__dirname, 'utf8').filter((fileName) => fileName.includes('.sql'))
      const lastSchemaVersion = schemaFiles.map(stripSchemaVersion).pop()

      const actualSchemaVersion = rows[0].value as number
      if (actualSchemaVersion !== undefined && actualSchemaVersion == lastSchemaVersion) {
        return MigrationStatus.NoNewMigrations
      } else {
        const updatesToExecute = schemaFiles.filter((fileName) => stripSchemaVersion(fileName) > actualSchemaVersion)

        for (const fileName of updatesToExecute) {
          const fileQuery = readFileSync(`${__dirname}/${fileName}`, 'utf8')
          await pg.query(fileQuery)

          const schemaVersion = stripSchemaVersion(fileName)
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
