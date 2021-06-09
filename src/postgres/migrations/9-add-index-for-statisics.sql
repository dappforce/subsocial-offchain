create index date_trunc_idx  on df.activities  (date_trunc('day',date));

create index date_brin_idx on df.activities using brin (date);