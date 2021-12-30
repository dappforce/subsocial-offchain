CREATE TABLE IF NOT EXISTS df.casted_votes
(
    poll_id bigint NOT NULL,
    account varchar(48) NOT NULL,
    vote text NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    signature text NOT NULL,
    PRIMARY KEY (poll_id, account)
);