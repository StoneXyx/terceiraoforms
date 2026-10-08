import {createClient} from '@supabase/supabase-js';
const URL=import.meta.env.VITE_SUPABASE_URL,KEY=import.meta.env.VITE_SUPABASE_ANON_KEY,K='perguntei_admin';
// usa só a chave pública (anon); o token de administrador vai num cabeçalho e é conferido pelo banco
const mk=t=>createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{'x-admin-token':t}}});
let cache=null;
export const hasToken=()=>!!sessionStorage.getItem(K);
export function admin(){const t=sessionStorage.getItem(K);if(!t)throw new Error('Sem token');if(!cache||cache.t!==t)cache={t,c:mk(t)};return cache.c}
export async function signIn(token){token=token.trim();const{data,error}=await mk(token).rpc('is_admin');if(error)throw error;if(data!==true)throw new Error('Token incorreto');sessionStorage.setItem(K,token)}
export function signOut(){sessionStorage.removeItem(K);cache=null}
