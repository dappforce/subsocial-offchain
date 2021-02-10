CREATE TABLE IF NOT EXISTS df.token_drops
(
    block_number bigint NOT NULL,
    event_index integer NOT NULL,
    faucet varchar(48) NOT NULL,
    account varchar(48) NOT NULL,
    amount double precision NOT NULL,
    captcha_solved boolean NOT NULL,
    original_email text NULL,
    formatted_email text NULL,
    telegram_id text NULL,
    discord_id text NULL,
    PRIMARY KEY (account)
);