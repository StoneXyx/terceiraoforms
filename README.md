# Perguntei — criador de questionários (Vite + Supabase)

Rotas:
- `/` → leva ao questionário **aberto** mais recente (ou avisa que não há nenhum)
- `/q/ID` → responder um questionário (público)
- `/dashboard` → painel de criação (exige o token de administrador)

## 1. Pré-requisitos
- Node.js 18+ (https://nodejs.org)
- Conta gratuita no Supabase (https://supabase.com)

## 2. Supabase
1. Crie um projeto.
2. **SQL Editor → New query**: cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Gere um token de administrador: no SQL Editor rode `select encode(extensions.gen_random_bytes(24), 'hex');` e copie o resultado (ou invente uma senha longa).
4. Abra `supabase/token.sql`, troque `COLE-AQUI-O-SEU-TOKEN` pelo seu token e rode no SQL Editor.
5. **Project Settings → API Keys**: copie a *Project URL* e a chave **Publishable** (ou *anon*) para o `.env`. Não use a chave secreta.

Esse token é a senha do `/dashboard`. Para trocá-lo, edite o `token.sql` e rode de novo.

## 3. Rodar no VS Code
```bash
npm install
cp .env.example .env     # preencha com a URL e a chave anon
npm run dev
```
Abra http://localhost:5173/dashboard, entre e crie um questionário.

## 4. Publicar com o domínio
1. Suba a pasta para o GitHub.
2. Na Vercel ou Netlify: *Import project*, adicione as duas variáveis do `.env` (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) e publique. Os arquivos `vercel.json` e `public/_redirects` já fazem as rotas funcionarem.
3. Aponte o domínio (terceiraofn.com) nas configurações de Domínios da hospedagem.

## Estrutura
```
src/main.js            roteador (/, /q/ID, /dashboard)
src/api.js             leitura e gravação no Supabase
src/auth.js            token de administrador do painel
src/ui.js              helpers e tipos de pergunta
src/views/dashboard.js login, lista, editor, link/QR, resultados, Excel
src/views/respondent.js tela de resposta (uma pergunta por vez)
src/style.css          visual
supabase/schema.sql    tabelas e regras de segurança
```
