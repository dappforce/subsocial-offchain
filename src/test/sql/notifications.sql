SELECT t.account
     , t.block_number
     , t.event_index
FROM df.notifications t
ORDER BY t.block_number
       , t.event_index