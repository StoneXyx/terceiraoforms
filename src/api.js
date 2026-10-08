import {sb} from './supabase.js';
import {admin} from './auth.js';
const fromRow=r=>({...r.data,id:r.id,title:r.title,open:r.open,updated:r.updated_at});
export async function loadForms(){const{data,error}=await admin().from('forms').select('*').order('updated_at',{ascending:false});if(error)throw error;return data.map(fromRow)}
export async function getForm(id){const{data}=await sb.from('forms').select('*').eq('id',id).maybeSingle();return data&&fromRow(data)}
export async function openForm(){const{data}=await sb.from('forms').select('*').eq('open',true).order('updated_at',{ascending:false}).limit(1);return data&&data[0]&&fromRow(data[0])}
export async function saveForm(f){const{id,title,open,updated,...rest}=f;const{error}=await admin().from('forms').upsert({id,title,open:open!==false,data:rest,updated_at:new Date().toISOString()});if(error)throw error}
export async function deleteForm(id){const{error}=await admin().from('forms').delete().eq('id',id);if(error)throw error}
export async function getResp(id){const{data,error}=await admin().from('responses').select('*').eq('form_id',id).order('created_at');if(error)throw error;return data.map(r=>({answers:r.answers,at:new Date(r.created_at).getTime()}))}
export async function sendResp(id,answers){const{error}=await sb.from('responses').insert({form_id:id,answers});if(error)throw error}
