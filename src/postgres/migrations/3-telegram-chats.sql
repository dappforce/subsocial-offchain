CREATE TABLE IF NOT EXISTS df.telegram_chats
(
    account varchar(48) NOT NULL,
    chat_id bigint NOT NULL,
    current_account boolean NOT NULL DEFAULT true,
    push_notifs boolean NOT NULL DEFAULT true,
    push_feeds boolean NOT NULL DEFAULT true,
    last_push_block_number bigint NOT NULL DEFAULT 0,
    last_push_event_index integer NULL,
    PRIMARY KEY (account, chat_id)
);