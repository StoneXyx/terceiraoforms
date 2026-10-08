-- Rode DEPOIS do schema.sql. Troque o texto entre aspas pelo SEU token
-- (use algo longo e aleatório; gere um com:  select encode(extensions.gen_random_bytes(24), 'hex');)
delete from public.admin_secret;
insert into public.admin_secret (token) values ('COLE-AQUI-O-SEU-TOKEN');
