import { pg } from '../connections/postgres'
import { release } from 'os'
import { postgesLog as log } from '../connections/loggers'
import { isEmptyArray } from '@subsocial/utils';

const truncateQuery = `
  TRUNCATE
  df.account_followers,
  df.activities,
  df.space_followers,
  df.post_followers,
  df.comment_followers,
  df.news_feed,
  df.notifications,
  df.notifications_counter`

const selectSchemaQuery = `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'df'`

pg.query(selectSchemaQuery, (err, result) => {
  if (err || isEmptyArray(result.rows)) {
    log.info(`Database doesn't exist. Nothing to clean.`)
    release()
    return
  }

  pg.query(truncateQuery, (err) => {
    if (err) throw err
    log.info('The database has been cleared')
  })
  release()
})
