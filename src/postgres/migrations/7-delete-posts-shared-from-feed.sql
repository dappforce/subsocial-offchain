DELETE FROM df.news_feed
    WHERE (block_number, event_index)
              IN (SELECT a.block_number, a.event_index FROM df.news_feed
                RIGHT JOIN df.activities a on a.block_number = news_feed.block_number and a.event_index = news_feed.event_index
                    WHERE event = 'PostShared')