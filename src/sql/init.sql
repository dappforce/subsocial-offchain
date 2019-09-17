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