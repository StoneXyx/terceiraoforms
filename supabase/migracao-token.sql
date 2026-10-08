-- Só rode se você JÁ tinha executado o schema.sql antigo (versão com login por e-mail)
drop policy if exists "forms_insert_dono" on public.forms;
drop policy if exists "forms_update_dono" on public.forms;
drop policy if exists "forms_delete_dono" on public.forms;
drop policy if exists "resp_leitura_dono" on public.responses;
alter table public.forms drop column if exists owner;
