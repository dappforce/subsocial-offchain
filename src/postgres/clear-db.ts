
import { pg } from '../connections/postgres';
import { release } from 'os';
import { postgesLog as log } from '../connections/loggers';

const query = `
  TRUNCATE
  df.account_followers,
  df.activities,
  df.space_followers,
  df.post_followers,
  df.comment_followers,
  df.news_feed,
  df.notifications,
  df.notifications_counter`;

pg.query(query, (err) => {
  if (err) throw err;
  log.info('The database has been cleared')
  release();
});
