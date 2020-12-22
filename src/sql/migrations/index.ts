import { exit } from 'process'
import { pg } from '../../connections/postgres'
import { postgesLog as log } from '../../connections/loggers'
import { isEmptyArray } from '@subsocial/utils'
import { readFileSync, readdirSync } from 'fs'

const RELATION_NOT_FOUND_ERROR = '42P01'
const updateSchemaVersionQuery = 'UPDATE "df"."schema_version" SET "value" = $1 WHERE "value" = $2'

export const INIT_FILE = readFileSync(`${__dirname}/1-init.sql`, 'utf8')

export enum MigrationStatus {
  NewMigrationExecuted,
  NoNewMigrations,
  SchemaError,
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
          await pg.query(fileName)

          const schemaVersion = stripSchemaVersion(fileName)
          await pg.query(updateSchemaVersionQuery, [schemaVersion, actualSchemaVersion])
        }

        return MigrationStatus.NewMigrationExecuted
      }
    } else {
      return MigrationStatus.SchemaError
    }
  } catch (error) {
    if (error.code === RELATION_NOT_FOUND_ERROR) {
      return MigrationStatus.SchemaError
    } else {
      log.error('Undefined error', error)
      exit()
    }
  }
}
