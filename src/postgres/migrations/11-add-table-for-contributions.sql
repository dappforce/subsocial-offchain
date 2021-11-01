CREATE TABLE IF NOT EXISTS df.referral_contributions
(
  contributor varchar(48) NOT NULL,
  ref_code varchar(48) NOT NULL,
  amount bigint NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (contributor, ref_code)
);