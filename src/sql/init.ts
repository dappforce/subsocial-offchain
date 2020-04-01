import { readFileSync } from 'fs';
import { pool } from '../adaptors/connect-postgre';
import { postgesLog as log } from '../adaptors/loggers';

const ENV = process.env.NODE_ENV || 'development';
const buildPath = ENV === 'production' ? 'build/' : '';
const initSchema = readFileSync(buildPath + 'src/sql/initSchema.sql', 'utf8');
const initDb = readFileSync(buildPath + 'src/sql/initDb.sql', 'utf8');

pool.query(initSchema, (err: string | undefined) => {
  if (err) throw new Error(err);
  pool.query(initDb, (err: string | undefined) => {
    if (err) {
      log.error('Failed to initialize a database', err)
      throw new Error(err)
    }
    log.info('Database inited');
  })
});
