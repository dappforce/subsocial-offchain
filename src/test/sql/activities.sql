SELECT t.account
     , t.block_number
     , t.event_index
     , t.event
     , t.following_id
     , t.space_id
     , t.post_id
     , t.comment_id
     , t.parent_comment_id
     , t.aggregated
     , t.agg_count
FROM df.activities t
ORDER BY t.block_number
       , t.event_index