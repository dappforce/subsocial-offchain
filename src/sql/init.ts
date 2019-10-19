import { readFileSync } from 'fs';
import { pool } from './../adaptors/connectPostgre';

const initSchema = readFileSync('src/sql/initSchema.sql', 'utf8'); 
const initDb = readFileSync('src/sql/initDb.sql', 'utf8'); 

pool.query(initSchema,(err) => {
    if (err) throw new Error(err);
    pool.query(initDb, (err) => {
        if (err) throw new Error(err);
        console.log('Database inited');
    })
});
