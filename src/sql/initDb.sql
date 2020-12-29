-- Create custom types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action') THEN
        CREATE TYPE df.action AS ENUM (
            'SpaceCreated',
            'SpaceUpdated',
            'SpaceFollowed',
            'SpaceUnfollowed',
            'AccountFollowed',
            'AccountUnfollowed',
            'PostCreated',
            'PostUpdated',
            'PostShared',
            'CommentCreated',
            'CommentUpdated',
            'CommentShared',
            'CommentDeleted',
            'CommentReplyCreated',
            'PostReactionCreated',
            'PostReactionUpdated',
            'CommentReactionCreated',
            'CommentReactionUpdated'
        );
    END IF;
END$$;


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'protocol') THEN
        CREATE TYPE df.protocol as ENUM (
            'WebApp',
            'Telegram',
            'Email'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS df.activities
(
    account varchar(48) NOT NULL,
    block_number bigint NOT NULL,
    event_index integer NOT NULL,
    event df.action NOT NULL,
    following_id varchar(48) NULL,
    space_id bigint NULL,
    post_id bigint NULL,
    comment_id bigint NULL,
    parent_comment_id bigint NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    aggregated boolean NOT NULL DEFAULT true,
    agg_count bigint NOT NULL DEFAULT 0,
    PRIMARY KEY (block_number, event_index)
);

CREATE TABLE IF NOT EXISTS df.news_feed
(
    account varchar(48) NOT NULL,
    block_number bigint NOT NULL,
    event_index integer NOT NULL,
    FOREIGN KEY (block_number, event_index)
        REFERENCES df.activities(block_number, event_index)
);

CREATE TABLE IF NOT EXISTS df.notifications
(
    account varchar(48) NOT NULL,
    block_number bigint NOT NULL,
    event_index integer NOT NULL,
    FOREIGN KEY (block_number, event_index)
        REFERENCES df.activities(block_number, event_index)
);

CREATE TABLE IF NOT EXISTS df.notifications_counter
(
    account varchar(48) NOT NULL UNIQUE,
    last_read_block_number bigint NULL DEFAULT NULL,
    last_read_event_index integer NULL DEFAULT NULL,
    unread_count bigint NOT NULL DEFAULT 0,
    FOREIGN KEY (last_read_block_number, last_read_event_index)
        REFERENCES df.activities(block_number, event_index)
);

CREATE TABLE IF NOT EXISTS df.account_followers
(
    follower_account varchar(48) NOT NULL,
    following_account varchar(48) NOT NULL
);

CREATE TABLE IF NOT EXISTS df.space_followers
(
    follower_account varchar(48) NOT NULL,
    following_space_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS df.post_followers
(
    follower_account varchar(48) NOT NULL,
    following_post_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS df.comment_followers
(
    follower_account varchar(48) NOT NULL,
    following_comment_id bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS df.session_keys
(
    account varchar(48) NOT NULL,
    session_key varchar(48) NOT NULL
);

CREATE TABLE IF NOT EXISTS df.nonces
(
    account varchar(48) NOT NULL UNIQUE,
    nonce bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_follower_account
ON df.account_followers(follower_account);

CREATE INDEX IF NOT EXISTS idx_following_account
ON df.account_followers(following_account);

CREATE INDEX IF NOT EXISTS idx_post_follower_account
ON df.post_followers(follower_account);

CREATE INDEX IF NOT EXISTS idx_space_follower_account
ON df.space_followers(follower_account);

CREATE INDEX IF NOT EXISTS idx_comment_follower_account
ON df.comment_followers(follower_account);

CREATE INDEX IF NOT EXISTS idx_following_post_id
ON df.post_followers(following_post_id);

CREATE INDEX IF NOT EXISTS idx_following_space_id
ON df.space_followers(following_space_id);

CREATE INDEX IF NOT EXISTS idx_following_comment_id
ON df.comment_followers(following_comment_id);

CREATE INDEX IF NOT EXISTS idx_account
ON df.activities(account);

CREATE INDEX IF NOT EXISTS idx_event
ON df.activities(event);

CREATE INDEX IF NOT EXISTS idx_following_id
ON df.activities(following_id);

CREATE INDEX IF NOT EXISTS idx_post_id
ON df.activities(post_id);

CREATE INDEX IF NOT EXISTS idx_space_id
ON df.activities(space_id);

CREATE INDEX IF NOT EXISTS idx_comment_id
ON df.activities(comment_id);

CREATE INDEX IF NOT EXISTS idx_parent_comment_id
ON df.activities(parent_comment_id);

-- CREATE INDEX IF NOT EXISTS idx_aggregated
-- ON df.activities(aggregated);
