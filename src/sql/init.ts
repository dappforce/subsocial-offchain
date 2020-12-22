import { pg } from '../connections/postgres'
import { postgesLog as log } from '../connections/loggers'
import { getMigrationStatus, MigrationStatus, INIT_FILE } from './migrations'
import { exit } from 'process'

const initSchema = () => {
  pg.query(INIT_FILE, (err: Error) => {
    if (err) {
      log.error('Failed to initialize the database', err)
      throw err
    }
  })
}

getMigrationStatus().then((migrationStatus) => {
  log.info(migrationStatus)
  if (migrationStatus === MigrationStatus.SchemaRestored) {
    return initSchema()
  }

  exit()
})
