alter table df.email_settings rename column email to original_email;
alter table df.email_settings add column formatted_email text null;

UPDATE df.email_settings AS settings
SET formatted_email = (
	SELECT LOWER(CONCAT(REGEXP_REPLACE(SPLIT_PART(original_email, '@', 1), '[^a-zA-Z1-9]+', '', 'g'), '@', SPLIT_PART(original_email, '@', 2)))
	FROM df.email_settings AS selected
	WHERE selected.account = settings.account
)
WHERE settings.formatted_email IS NULL;

ALTER TABLE df.email_settings ALTER COLUMN formatted_email SET NOT NULL