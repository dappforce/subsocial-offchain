CREATE TABLE df.activity_stream
(
    account varchar(48) NOT NULL,
    actitvity_id bigint NOT NULL
);

CREATE TABLE df.activities
(
    id bigserial not null primary key,
    account varchar(48) NOT NULL,
    event df.action NOT NULL,
    following_id varchar(48) NULL,
    blog_id varchar(16) NULL,
    post_id varchar(16) NULL,
    comment_id varchar(16) NULL
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

CREATE TYPE df.action AS ENUM (
'BlogCreated',
'BlogUpdated',
'BlogFollowed',
'BlogUnfollowed',
'AccountFollowed',
'AccountUnfollowed',
'PostCreated',
'PostUpdated',
'CommentCreated',
'CommentUpdated',
'PostReactionCreated',
'PostReactionUpdated',
'CommentReactionCreated',
'CommentReactionUpdated')
