CREATE TABLE IF NOT EXISTS df.referral_contributions
(
  block_number bigint NOT NULL,
  event_index integer NOT NULL,
  contributor varchar(48) NOT NULL,
  ref_code varchar(48) NOT NULL,
  amount bigint NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (block_number, event_index, contributor, ref_code)
);