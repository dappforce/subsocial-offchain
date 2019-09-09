

import { pool } from './../adaptors/connectPostgre';

const query = `
  TRUNCATE
  df.account_followers,
  df.activities,
  df.blog_followers,
  df.post_followers,
  df.comment_followers,
  df.news_feed,
  df.notifications,
  df.agg_stream`;

pool.query(query, (err) => {
  if (err) throw err;
  console.log('The database has been cleared')
});