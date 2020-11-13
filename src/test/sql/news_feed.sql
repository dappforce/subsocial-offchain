SELECT t.account
     , t.block_number
     , t.event_index
FROM df.news_feed t
ORDER BY t.block_number
       , t.event_index