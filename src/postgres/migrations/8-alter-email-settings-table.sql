alter table df.email_settings rename column email to  original_email;
alter table df.email_settings add column formatted_email text null