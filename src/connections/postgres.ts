import { Pool } from 'pg'
import { postgesLog as log } from './loggers';

require('dotenv').config();

const pgConf: any = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
};

let greeted = false
if (!greeted) {
  greeted = true;
  log.info(`Connecting to Postgres at ${pgConf.host}:${pgConf.port} as a user '${pgConf.user}'`);
}

// Add method for serialize
(BigInt.prototype as any).toJSON = function() {
  return this.toString()
}

// Type Id 20 = BIGINT | BIGSERIAL
// types.setTypeParser(20, BigInt)

// 1016 = Type Id for arrays of BigInt values
// const parseBigIntArray = types.getTypeParser(1016)
// types.setTypeParser(1016, a => parseBigIntArray(a).map(BigInt))

export const pg = new Pool(pgConf);



