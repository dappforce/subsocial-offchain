CREATE TABLE IF NOT EXISTS df.linked_emails
(
    account varchar(48) NOT NULL,
    email text NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    signature text NOT NULL,
    PRIMARY KEY (account)
);