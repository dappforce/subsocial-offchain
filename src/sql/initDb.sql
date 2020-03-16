-- Create custom types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action') THEN
        CREATE TYPE df.action AS ENUM (
            'BlogCreated',
            'BlogUpdated',
            'BlogFollowed',
            'BlogUnfollowed',
            'AccountFollowed',
            'AccountUnfollowed',
            'PostCreated',
            'PostUpdated',
            'PostShared',
            'CommentCreated',
            'CommentUpdated',
            'PostReactionCreated',
            'PostReactionUpdated',
            'CommentReactionCreated',
            'CommentReactionUpdated'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS df.news_feed
(
    account varchar(48) NOT NULL,
    activity_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS df.notifications
(
    account varchar(48) NOT NULL,
    activity_id bigint NOT NULL
);


CREATE TABLE IF NOT EXISTS df.notifications_counter
(
    account varchar(48) NOT NULL,
    last_read_activity_id bigint NOT NULL,
    unread_count bigint NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS df.activities
(
    id bigserial not null primary key,
    account varchar(48) NOT NULL,
    event df.action NOT NULL,
    following_id varchar(48) NULL,
    blog_id varchar(16) NULL,
    post_id varchar(16) NULL,
    comment_id varchar(16) NULL,
    parent_comment_id varchar(16) NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    block_height bigint NOT NULL,
    aggregated boolean NOT NULL DEFAULT true,
    agg_count bigint NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS df.account_followers
(
    follower_account varchar(48) NOT NULL,
    following_account varchar(48) NOT NULL
);

CREATE TABLE IF NOT EXISTS df.blog_followers
(
    follower_account varchar(48) NOT NULL,
    following_blog_id varchar(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS df.post_followers
(
    follower_account varchar(48) NOT NULL,
    following_post_id varchar(16) NOT NULL
);

CREATE TABLE IF NOT EXISTS df.comment_followers
(
    follower_account varchar(48) NOT NULL,
    following_comment_id varchar(16) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_follower_account 
ON df.account_followers(follower_account);

CREATE INDEX IF NOT EXISTS idx_following_account 
ON df.account_followers(following_account);

CREATE INDEX IF NOT EXISTS idx_post_follower_account 
ON df.post_followers(follower_account);

CREATE INDEX IF NOT EXISTS idx_blog_follower_account 
ON df.blog_followers(follower_account);

CREATE INDEX IF NOT EXISTS idx_comment_follower_account 
ON df.comment_followers(follower_account);

CREATE INDEX IF NOT EXISTS idx_following_post_id 
ON df.post_followers(following_post_id);

CREATE INDEX IF NOT EXISTS idx_following_blog_id 
ON df.blog_followers(following_blog_id);

CREATE INDEX IF NOT EXISTS idx_following_comment_id 
ON df.comment_followers(following_comment_id);

CREATE INDEX IF NOT EXISTS idx_id
ON df.activities(id);

CREATE INDEX IF NOT EXISTS idx_account
ON df.activities(account);

CREATE INDEX IF NOT EXISTS idx_event
ON df.activities(event);

CREATE INDEX IF NOT EXISTS idx_following_id
ON df.activities(following_id);

CREATE INDEX IF NOT EXISTS idx_post_id
ON df.activities(post_id);

CREATE INDEX IF NOT EXISTS idx_blog_id
ON df.activities(blog_id);

CREATE INDEX IF NOT EXISTS idx_comment_id
ON df.activities(comment_id);

CREATE INDEX IF NOT EXISTS idx_parent_comment_id
ON df.activities(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_aggregated
ON df.activities(aggregated);
