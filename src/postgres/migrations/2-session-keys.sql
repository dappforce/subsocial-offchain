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
