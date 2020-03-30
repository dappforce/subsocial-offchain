
import { pool } from '../adaptors/connect-postgre';
import { release } from 'os';
import { postgesLog as log } from '../adaptors/loggers';

const query = `
  TRUNCATE
  df.account_followers,
  df.activities,
  df.blog_followers,
  df.post_followers,
  df.comment_followers,
  df.news_feed,
  df.notifications,
  df.notifications_counter`;

pool.query(query, (err) => {
  if (err) throw err;
  log.info('The database has been cleared')
  release();
});
