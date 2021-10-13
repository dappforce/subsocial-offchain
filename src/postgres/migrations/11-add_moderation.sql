ALTER TABLE df.activities ADD column report_id bigint;
ALTER TABLE df.activities ADD column scopeId bigint;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_kind') THEN
        CREATE TYPE df.entity_kind AS ENUM (
            'Space',
            'Post',
            'Account',
            'Content'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS df.moderation
(
  entity_kind df.entity_kind NOT NULL,
  entity_num_id bigint,
  entity_str_id varchar(54),
  blocked boolean default false,
  scope_id bigint NOT NULL,
  PRIMARY KEY (entity_kind, entity_num_id, entity_str_id, scope_id)
);

ALTER TYPE df.action ADD VALUE 'EntityReported';
ALTER TYPE df.action ADD VALUE 'EntityStatusUpdated';
ALTER TYPE df.action ADD VALUE 'EntityStatusDeleted';