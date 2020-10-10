CREATE DOMAIN account as char(48);
CREATE DOMAIN ipfs_cid as varchar(59) CHECK (LENGTH(ipfs_cid) >= 46);
CREATE DOMAIN id as bigserial;

CREATE TABLE IF NOT EXISTS df.spaces
(
    id id NOT NULL primary key UNIQUE,
    created_by_account account NOT NULL,
    created_at_block bigint NOT NULL,
    created_at_time bigint NOT NULL,

    updated_by_account account NULL,
    updated_at_block bigint NULL,
    updated_at_time bigint NULL,

    owner account NOT NULL,

    parent_id id REFERENCES df.spaces (id) NULL,
    handle varchar(48) NULL,
    content ipfs_cid NULL,
    hidden boolean NOT NULL DEFAULT false,

    posts_count integer NOT NULL DEFAULT 0,
    hidden_posts_count integer NOT NULL DEFAULT 0, 
    followers_count integer NOT NULL DEFAULT 0,
    
    score integer NOT NULL DEFAULT 0,
    -- permissions df.permissions NULL
);

CREATE TABLE IF NOT EXISTS df.posts
(
    id id NOT NULL primary key UNIQUE,
    created_by_account account NOT NULL,
    created_at_block bigint NOT NULL,
    created_at_time bigint NOT NULL,

    updated_by_account account NULL,
    updated_at_block bigint NULL,
    updated_at_time bigint NULL,

    owner account NOT NULL,

    comment comment NULL,
    shared_post_id id REFERENCES df.posts (id) NULL,

    space_id id REFERENCES df.spaces (id) NULL,
    content ipfs_cid NULL,
    hidden boolean NOT NULL DEFAULT false,

    replies_count integer NOT NULL DEFAULT 0,
    hidden_replies_count integer NOT NULL DEFAULT 0,
    shares_count integer NOT NULL DEFAULT 0,
    upvotes_count integer NOT NULL DEFAULT 0,
    downvotes_count integer NOT NULL DEFAULT 0,

    score integer NOT NULL DEFAULT 0
);

CREATE TYPE IF NOT EXISTS comment AS
(
    parent_id id REFERENCES df.posts (id) NULL,
    root_post_id id REFERENCES df.posts (id) NOT NULL
);