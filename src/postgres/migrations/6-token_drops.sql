CREATE TABLE IF NOT EXISTS df.token_drops
(
    faucet varchar(48) NOT NULL,
    account varchar(48) NOT NULL,
    amount double precision NOT NULL,
    captcha_solved boolean NOT NULL,
    email text NULL,
    telegram_id text NULL,
    discord_id text NULL,
    PRIMARY KEY (account)
);