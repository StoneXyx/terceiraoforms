import {h,ic,$app,$top,PH,HT} from '../ui.js';
import {getForm,sendResp} from '../api.js';

/* ---------- RESPONDENTE ---------- */
export async function respondent(id){
  $top.style.display='none';
  let f=await getForm(id).catch(()=>null);
  const root=h('div',{class:'full'});$app.replaceChildren(root);if(f&&f.color)root.style.setProperty('--pri',f.color);
  const shellOf=(...c)=>root.replaceChildren(h('div',{class:'blob'}),h('div',{class:'blob b2'}),h('div',{class:'shell',style:'grid-template-columns:1fr'},h('div',{class:'main'},h('div',{class:'stage'},c))));
  if(!f)return shellOf(ic('search_off','big-ic'),h('h2',{class:'qt'},'Questionário não encontrado'));
  if(f.open===false)return shellOf(ic('lock','big-ic'),h('h2',{class:'qt'},'Este questionário não está aceitando respostas.'));
  const qs=f.questions,K='qp_'+id;let ans={},i=-1,hist=[],saved=null;
  try{saved=JSON.parse(localStorage.getItem(K))}catch(e){}
  const persist=()=>{try{localStorage.setItem(K,JSON.stringify({ans,i,hist}))}catch(e){}};
  const empty=v=>v==null||v===''||(Array.isArray(v)&&!v.length);
  function check(q){const v=ans[q.id];if(empty(v))return q.required?'Esta pergunta é obrigatória.':'';const s=String(v);
    if(q.type==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s))return 'Informe um e-mail válido.';
    if(q.type==='phone'&&!/^\d{10,11}$/.test(s.replace(/\D/g,'')))return 'Informe o telefone com DDD.';
    if(q.type==='number'&&isNaN(Number(s)))return 'Informe um número.';
    if(q.type==='cpf'){const d=s.replace(/\D/g,'');const dv=n=>{let t=0;for(let k=0;k<n;k++)t+=d[k]*(n+1-k);t=t*10%11;return t===10?0:t};if(d.length!==11||/^(\d)\1+$/.test(d)||dv(9)!=d[9]||dv(10)!=d[10])return 'CPF inválido.'}
    return ''}
  function target(){const q=qs[i];if(q.type==='single'||q.type==='yesno'){const o=q.options.find(o=>o.t===ans[q.id]);if(o&&o.go){if(o.go==='end')return qs.length;const k=qs.findIndex(x=>x.id===o.go);if(k>i)return k}}return i+1}
  function next(){if(i>=qs.length)return;if(i>=0){const e=check(qs[i]);if(e){const el=document.getElementById('err');if(el)el.textContent=e;return}
      const n=target();if(n>=qs.length)return send();hist.push(i);i=n}else i=0;persist();draw()}
  function prev(){if(i<=0){i=-1}else i=hist.pop()??i-1;persist();draw()}
  async function send(){    try{await sendResp(id,ans)}catch(e){return alert('Não foi possível enviar. Tente novamente.')}
    try{localStorage.removeItem(K)}catch(e){}i=qs.length;draw()}
  const pick=(q,v)=>{ans[q.id]=v;persist()};
  function input(q){
    if(q.type==='long'){const t=h('textarea',{class:'big ans',placeholder:PH.long,value:ans[q.id]||'',oninput:e=>pick(q,e.target.value),onkeydown:e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();next()}}});setTimeout(()=>t.focus(),60);return t}
    if(['short','email','phone','cpf','number','date'].includes(q.type)){const t=h('input',{class:'big ans',type:HT[q.type]||'text',placeholder:PH[q.type]||'',value:ans[q.id]||'',oninput:e=>pick(q,e.target.value)});setTimeout(()=>t.focus(),60);return t}
    if(q.type==='scale'){const g=h('div',{class:'num-g'});for(let k=0;k<=10;k++)g.append(h('button',{class:ans[q.id]===k?'on':'',onclick:()=>{pick(q,k);setTimeout(next,220);[...g.children].forEach((b,x)=>b.classList.toggle('on',x===k))}},String(k)));return g}
    if(q.type==='stars'){const g=h('div',{class:'stars'});for(let k=1;k<=5;k++)g.append(h('span',{class:'ms f'+(k<=(ans[q.id]||0)?' on':''),onclick:()=>{pick(q,k);setTimeout(next,260);[...g.children].forEach((s,x)=>s.classList.toggle('on',x<k))}},'star'));return g}
    const multi=q.type==='multi',g=h('div',{class:'oc-g'});
    q.options.forEach(o=>{const on=()=>multi?(ans[q.id]||[]).includes(o.t):ans[q.id]===o.t;const el=h('div',{class:'oc'+(on()?' on':''),onclick:()=>{
      if(multi){const a=ans[q.id]||[];pick(q,a.includes(o.t)?a.filter(x=>x!==o.t):[...a,o.t]);el.classList.toggle('on')}
      else{pick(q,o.t);[...g.children].forEach(c=>c.classList.remove('on'));el.classList.add('on');setTimeout(next,260)}}},o.t,ic('check'));g.append(el)});return g}
  function draw(){
    const done=i>=qs.length,pct=done?100:i<0?0:Math.round(100*i/qs.length),C=2*Math.PI*44;
    const ring=h('div',{class:'ring'},h('div',{innerHTML:`<svg width="104" height="104" viewBox="0 0 104 104"><circle cx="52" cy="52" r="44" fill="none" stroke="var(--ln)" stroke-width="7"/><circle cx="52" cy="52" r="44" fill="none" stroke="var(--pri)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct/100)}" style="transition:stroke-dashoffset .4s"/></svg>`}),h('b',{},pct+'%'));
    const side=h('aside',{class:'side'},h('div',{class:'brand hide'},f.title),ring,h('div',{class:'mut'},done?'Concluído':i<0?qs.length+' perguntas':(i+1)+'/'+qs.length),h('span',{class:'sp'}),
      h('div',{class:'mut hide',style:'text-align:left'},h('span',{class:'kb'},'ENTER'),'Confirmar'),
      i>=0&&!done?h('button',{class:'lnk hide',onclick:()=>{persist();alert('Progresso salvo neste dispositivo. Volte pelo mesmo link para continuar.')}},'Salvar e continuar depois'):'');
    let st;
    if(i<0){st=[ic('waving_hand','big-ic'),h('h2',{class:'qt'},f.title),h('p',{class:'mut'},f.welcome||'Leva cerca de '+Math.max(1,Math.round(qs.length*.4))+' min.'),
      h('div',{class:'nav'},saved&&saved.i>=0&&saved.i<qs.length?[h('button',{onclick:()=>{saved=null;try{localStorage.removeItem(K)}catch(e){}ans={};hist=[];next()}},'Recomeçar'),h('button',{class:'p',onclick:()=>{ans=saved.ans;hist=saved.hist;i=saved.i;draw()}},'Continuar')]:h('button',{class:'p',onclick:next},'Começar',ic('arrow_forward')))]}
    else if(done){st=[h('div',{},ic('auto_awesome','spk'),ic('thumb_up','big-ic'),ic('auto_awesome','spk')),h('h2',{class:'qt'},f.thanks||'Recebemos sua resposta!'),h('p',{class:'mut'},'Obrigado por participar.')]}
    else{const q=qs[i];st=[h('div',{class:'qc'},'Pergunta '+(i+1)+'/'+qs.length),h('h2',{class:'qt'},q.text+(q.required?' *':'')),input(q),h('div',{class:'err',id:'err'}),
      h('div',{class:'nav'},h('button',{class:'ib',onclick:prev},ic('arrow_back'),'Anterior'),h('button',{class:'p',onclick:next},target()>=qs.length?'Enviar':'Próximo',ic('arrow_forward')))]}
    const main=h('section',{class:'main'},h('div',{class:'stage'},st),h('div',{class:'foot'},h('span',{},'Feito pelo Terceirão FN'),h('span',{},done?'':'Shift+Enter: nova linha')));
    root.replaceChildren(h('div',{class:'blob'}),h('div',{class:'blob b2'}),h('div',{class:'shell'},side,main));
  }
  if(window.__kh)removeEventListener('keydown',window.__kh);
  window.__kh=e=>{if(e.key==='Enter'&&!['TEXTAREA','BUTTON'].includes(e.target.tagName)){e.preventDefault();next()}};addEventListener('keydown',window.__kh);
  draw();
}
