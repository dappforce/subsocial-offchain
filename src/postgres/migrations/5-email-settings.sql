CREATE TABLE IF NOT EXISTS df.email_settings
(
    account varchar(48) NOT NULL,
    email varchar(48) NOT NULL,
    last_block_number bigint NOT NULL DEFAULT 0,
    last_event_index integer NOT NULL DEFAULT 0,
    send_notifs boolean NOT NULL DEFAULT false,
    send_feeds boolean NOT NULL DEFAULT false,
    recurrence varchar(48) NOT NULL,
    confirmation_code varchar(48) NULL,
    expires_on TIMESTAMP NULL,
    confirmed_on TIMESTAMP NULL,
    PRIMARY KEY (account, email)
);