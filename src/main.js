import './style.css';
import {$app,$top,msg} from './ui.js';
import {hasToken} from './auth.js';
import {openForm} from './api.js';
import {respondent} from './views/respondent.js';
import {home,login} from './views/dashboard.js';

async function route(){
  const path=location.pathname.replace(/\/+$/,'')||'/';
  if(path==='/dashboard'){
    $top.style.display='';
    return hasToken()?home():login();
  }
  const m=path.match(/^\/q\/([\w-]+)$/);
  if(m)return respondent(m[1]);
  // página inicial: leva ao questionário aberto mais recente
  $top.style.display='none';
  const f=await openForm().catch(()=>null);
  if(f){history.replaceState(null,'','/q/'+f.id);return respondent(f.id)}
  $app.replaceChildren(msg('inbox','Nenhum questionário aberto no momento','Volte mais tarde.'));
}
window.addEventListener('popstate',route);
route();
