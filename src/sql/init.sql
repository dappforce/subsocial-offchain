CREATE SCHEMA df

CREATE TYPE df.action AS ENUM (
'BlogCreated',
'BlogUpdated',
'FollowBlog',
'BlogUnfollowed',
'FollowAccount',
'UnfollowAccount',
'PostCreated',
'PostUpdated',
'CommentCreated'
'CommentCreatedOnComment',
'CommentUpdated',
'PostReactionCreated',
'PostReactionUpdated',
'CommentReactionCreated',
'CommentReactionUpdated');

CREATE TABLE df.news_feed
(
    account varchar(48) NOT NULL,
    activity_id bigint NOT NULL
);

CREATE TABLE df.notifications
(
    account varchar(48) NOT NULL,
    activity_id bigint NOT NULL
);

CREATE TABLE df.activities
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

CREATE TABLE df.account_followers
(
    follower_account varchar(48) NOT NULL,
    following_account varchar(48) NOT NULL
);

CREATE TABLE df.blog_followers
(
    follower_account varchar(48) NOT NULL,
    following_blog_id varchar(16) NOT NULL
);

CREATE TABLE df.post_followers
(
    follower_account varchar(48) NOT NULL,
    following_post_id varchar(16) NOT NULL
);

CREATE TABLE df.comment_followers
(
    follower_account varchar(48) NOT NULL,
    following_comment_id varchar(16) NOT NULL
);

CREATE TABLE df.agg_stream
(
    id bigserial not null primary key,
    account varchar(48) NOT NULL,
    event df.action NOT NULL,
    following_id varchar(48) NULL,
    subject_id varchar(16) NULL,
    subject_count bigint not null default 0 
);

CREATE INDEX idx_follower_account 
ON df.account_followers(follower_account);

CREATE INDEX idx_following_account 
ON df.account_followers(following_account);

CREATE INDEX idx_post_follower_account 
ON df.post_followers(follower_account);

CREATE INDEX idx_blog_follower_account 
ON df.blog_followers(follower_account);

CREATE INDEX idx_comment_follower_account 
ON df.comment_followers(follower_account);

CREATE INDEX idx_following_post_id 
ON df.post_followers(following_post_id);

CREATE INDEX idx_following_blog_id 
ON df.blog_followers(following_blog_id);

CREATE INDEX idx_following_comment_id 
ON df.comment_followers(following_comment_id);

CREATE INDEX idx_id
ON df.activities(id);

CREATE INDEX idx_account
ON df.activities(account);

CREATE INDEX idx_event
ON df.activities(event);

CREATE INDEX idx_following_id
ON df.activities(following_id);

CREATE INDEX idx_post_id
ON df.activities(post_id);

CREATE INDEX idx_blog_id
ON df.activities(blog_id);

CREATE INDEX idx_comment_id
ON df.activities(comment_id);

CREATE INDEX idx_parent_comment_id
ON df.activities(parent_comment_id);

CREATE INDEX idx_aggregated
ON df.activities(aggregated);
