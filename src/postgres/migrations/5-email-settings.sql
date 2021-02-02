-- Create custom types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'periodicity') THEN
        CREATE TYPE df.periodicity AS ENUM (
            'Immediately',
            'Daily',
            'Weekly',
            'Never'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS df.email_settings
(
    account varchar(48) NOT NULL,
    email text NOT NULL,
    last_block_number bigint NOT NULL DEFAULT 0,
    last_event_index integer NOT NULL DEFAULT 0,
    send_notifs boolean NOT NULL DEFAULT false,
    send_feeds boolean NOT NULL DEFAULT false,
    periodicity df.periodicity NOT NULL DEFAULT 'Never',
    confirmation_code varchar(36) NULL,
    expires_on TIMESTAMP NULL,
    confirmed_on TIMESTAMP NULL,
    PRIMARY KEY (account)
);