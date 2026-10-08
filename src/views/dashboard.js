import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import {h,ic,T,norm,TPL,uid,$app,go} from '../ui.js';
import {loadForms,saveForm,deleteForm,getResp} from '../api.js';
import {signOut,signIn} from '../auth.js';

export function login(){
  const tk=h('input',{type:'password',placeholder:'Token de administrador',autocomplete:'off'}),err=h('div',{class:'err'});
  const sub=async()=>{err.textContent='';try{await signIn(tk.value);go('/dashboard')}catch(e){err.textContent='Token incorreto, ou o schema.sql ainda não foi executado no Supabase.'}};
  tk.addEventListener('keydown',e=>{if(e.key==='Enter')sub()});
  $app.replaceChildren(h('div',{class:'card',style:'max-width:420px;margin:40px auto'},h('h2',{},ic('key','pri'),'Entrar no painel'),h('p',{class:'mut'},'Digite o token que você cadastrou no Supabase. Ele fica guardado só nesta aba e é apagado ao fechá-la.'),h('div',{class:'row'},tk),err,h('button',{class:'p',onclick:sub},'Entrar')));
}
/* ---------- PAINEL ---------- */
export async function home(){
  const forms=await loadForms();
  $app.replaceChildren(h('div',{class:'row'},h('h1',{style:'margin:0'},'Meus questionários'),h('span',{class:'sp'}),h('button',{class:'p',onclick:chooser},ic('add'),'Novo questionário')),
    ...forms.map(f=>h('div',{class:'card'},h('div',{class:'row'},h('h2',{style:'margin:0'},f.title||'(sem título)'),h('span',{class:'tag'+(f.open===false?' off':'')},f.open===false?'Fechado':'Aberto')),
      h('div',{class:'mut'},(f.questions||[]).length+' perguntas'),
      h('div',{class:'row'},h('button',{onclick:()=>detail(f)},ic('insights'),'Resultados e link'),h('button',{onclick:()=>edit(f)},ic('edit'),'Editar')))),
    forms.length?'':h('div',{class:'card mut'},'Nenhum questionário ainda. Clique em "Novo questionário".'),
    h('button',{class:'ib',onclick:async()=>{await signOut();go('/dashboard')}},ic('logout'),'Sair'));
}
export function chooser(){
  $app.replaceChildren(h('h1',{},'Como quer começar?'),h('div',{class:'tpl'},...Object.values(TPL).map(([n,i,mk])=>h('button',{onclick:()=>edit(mk())},ic(i),n))),
    h('p',{},h('button',{onclick:home},ic('arrow_back'),'Voltar')));
}
function stepper(cur,labels,go){const o=[];labels.forEach((l,k)=>{if(k)o.push(h('i'));o.push(h('div',{class:'s '+(k===cur?'on':k<cur?'done':''),onclick:()=>go(k)},h('span',{class:'dot'},k<cur?ic('check'):String(k+1)),l))});return h('div',{class:'stp'},o)}

/* ---------- EDITOR ---------- */
export function edit(f){
  f=JSON.parse(JSON.stringify(f));f.id=f.id||uid();f.color=f.color||'#3b5bff';f.open=f.open!==false;f.questions.forEach(norm);
  let step=0;const body=h('div');
  const draw=()=>{$app.replaceChildren(stepper(step,['Perguntas','Aparência','Publicar'],k=>{step=k;draw()}),body);body.replaceChildren(...[s1,s2,s3][step]())};
  function s1(){
    const qbox=h('div');
    const mv=(i,d)=>{const j=i+d;if(j<0||j>=f.questions.length)return;[f.questions[i],f.questions[j]]=[f.questions[j],f.questions[i]];dq()};
    const dq=()=>qbox.replaceChildren(...f.questions.map(qcard));
    function qcard(q,i){
      const c=h('div',{class:'card'},
        h('div',{class:'row'},h('span',{class:'qn'},String(i+1)),h('input',{type:'text',placeholder:'Digite a pergunta',value:q.text,oninput:e=>q.text=e.target.value}),
          h('button',{class:'ib',onclick:()=>mv(i,-1)},ic('arrow_upward')),h('button',{class:'ib',onclick:()=>mv(i,1)},ic('arrow_downward')),h('button',{class:'ib d',onclick:()=>{f.questions.splice(i,1);dq()}},ic('delete'))),
        h('div',{class:'row'},ic(T[q.type][1],'pri'),h('select',{class:'lg',onchange:e=>{q.type=e.target.value;norm(q);dq()}},...Object.entries(T).map(([k,v])=>h('option',{value:k,selected:q.type===k},v[0]))),
          h('label',{class:'mut'},h('input',{type:'checkbox',checked:q.required,onchange:e=>q.required=e.target.checked}),' Obrigatória')));
      if(['single','multi','yesno'].includes(q.type)){
        q.options.forEach((o,j)=>{const r=h('div',{class:'row'},ic(q.type==='multi'?'check_box_outline_blank':'radio_button_unchecked','mut'),h('input',{type:'text',value:o.t,disabled:q.type==='yesno',oninput:e=>o.t=e.target.value}));
          if(q.type!=='multi'&&i<f.questions.length-1){r.append(ic('call_split','pri'),h('select',{class:'lg',title:'Lógica condicional',onchange:e=>o.go=e.target.value},
            h('option',{value:''},'Próxima pergunta'),...f.questions.slice(i+1).map((x,k)=>h('option',{value:x.id,selected:o.go===x.id},'Ir para '+(i+k+2)+'. '+(x.text||'…').slice(0,22))),h('option',{value:'end',selected:o.go==='end'},'Encerrar')))}
          if(q.type!=='yesno'&&q.options.length>2)r.append(h('button',{class:'ib d',onclick:()=>{q.options.splice(j,1);dq()}},ic('close')));c.append(r)});
        if(q.type!=='yesno')c.append(h('button',{onclick:()=>{q.options.push({t:'Opção '+(q.options.length+1)});dq()}},ic('add'),'Opção'));
      }
      return c}
    dq();
    return[h('div',{class:'card'},h('input',{type:'text',class:'',style:'font-size:18px;font-weight:700',placeholder:'Título do questionário',value:f.title,oninput:e=>f.title=e.target.value})),qbox,
      h('div',{class:'card'},h('div',{class:'mut',style:'margin-bottom:8px'},'ADICIONAR PERGUNTA'),h('div',{class:'chips'},...Object.entries(T).map(([k,v])=>h('button',{class:'chip',onclick:()=>{f.questions.push(norm({type:k,text:'',required:false}));dq()}},ic(v[1]),v[0])))),
      foot(null,1)]}
  function s2(){return[h('div',{class:'card'},h('h2',{},ic('palette','pri'),'Cor da marca'),h('div',{class:'row'},h('input',{type:'color',value:f.color,oninput:e=>f.color=e.target.value,style:'width:56px;height:40px;border:0;background:none'}),
      ...['#3b5bff','#5b3df5','#0ea5a4','#e8590c','#d6336c','#1a1f36'].map(c=>h('button',{class:'ib',onclick:()=>{f.color=c;draw()}},h('span',{style:'width:24px;height:24px;border-radius:50%;background:'+c+';display:block'}))))),
    h('div',{class:'card'},h('h2',{},ic('waving_hand','pri'),'Mensagem de boas-vindas'),h('textarea',{value:f.welcome||'',placeholder:'Opcional. Ex.: Leva menos de 2 minutos!',oninput:e=>f.welcome=e.target.value}),
      h('h2',{style:'margin-top:14px'},ic('thumb_up','pri'),'Mensagem final'),h('textarea',{value:f.thanks||'',placeholder:'Recebemos sua resposta! Obrigado.',oninput:e=>f.thanks=e.target.value})),foot(0,2)]}
  function s3(){return[h('div',{class:'card'},h('h2',{},ic('rocket_launch','pri'),'Tudo pronto?'),h('p',{class:'mut'},f.questions.length+' perguntas · cerca de '+Math.max(1,Math.round(f.questions.length*.4))+' min para responder.'),
      h('label',{},h('input',{type:'checkbox',checked:f.open,onchange:e=>f.open=e.target.checked}),' Aceitando respostas')),foot(1,null)]}
  function foot(prev,next){return h('div',{class:'row'},prev!==null?h('button',{onclick:()=>{step=prev;draw()}},ic('arrow_back'),'Voltar'):h('button',{onclick:home},ic('close'),'Cancelar'),h('span',{class:'sp'}),
    next!==null?h('button',{class:'p',onclick:()=>{step=next;draw()}},'Continuar',ic('arrow_forward')):h('button',{class:'p',onclick:async()=>{
      if(!f.title.trim()||!f.questions.length||f.questions.some(q=>!q.text.trim()))return alert('Informe o título e o texto de todas as perguntas.');
      await saveForm(f);detail(f)}},ic('check'),'Salvar e publicar'))}
  draw();
}

/* ---------- LINK + RESULTADOS ---------- */
export async function detail(f,tab='share'){
  const tabs=h('div',{class:'tabs'},...[['share','Compartilhar','share'],['res','Resultados','insights']].map(([k,l,i])=>h('button',{class:tab===k?'on':'',onclick:()=>detail(f,k)},ic(i),l)));
  const body=h('div');$app.replaceChildren(h('div',{class:'row'},h('button',{class:'ib',onclick:home},ic('arrow_back')),h('h1',{style:'margin:0'},f.title)),tabs,body);
  if(tab==='share'){
    const url=location.origin+'/q/'+f.id,qr=h('div',{id:'qr'});
    body.append(h('div',{class:'card'},h('h2',{},ic('link','pri'),'Link para responder'),h('div',{class:'link'},url),h('p',{class:'mut'},'Link geral do site (leva ao questionário aberto mais recente): '+location.origin),
      h('div',{class:'row'},h('button',{onclick:()=>navigator.clipboard&&navigator.clipboard.writeText(url)},ic('content_copy'),'Copiar'),h('button',{onclick:()=>go('/q/'+f.id)},ic('visibility'),'Testar')),qr),
      h('div',{class:'card'},h('div',{class:'row'},h('b',{},'Status: '+(f.open===false?'fechado':'aceitando respostas')),h('span',{class:'sp'}),
        h('button',{onclick:async()=>{f.open=f.open===false;await saveForm(f);detail(f)}},ic(f.open===false?'lock_open':'lock'),f.open===false?'Reabrir':'Fechar'),
        h('button',{onclick:async()=>{const c={...JSON.parse(JSON.stringify(f)),id:uid(),title:f.title+' (cópia)'};await saveForm(c);home()}},ic('content_copy'),'Duplicar'),
        h('button',{onclick:async()=>{if(!confirm('Excluir este questionário?'))return;await deleteForm(f.id);home()}},ic('delete'),'Excluir'))));
    QRCode.toDataURL(url,{width:180,margin:1}).then(u=>qr.append(h('img',{src:u,width:180,height:180})));
  }else{
    const rs=await getResp(f.id);
    body.append(h('div',{class:'kpis'},h('div',{class:'card kpi'},h('span',{class:'mut'},'Respostas'),h('b',{},String(rs.length))),
      h('div',{class:'card kpi'},h('span',{class:'mut'},'Última resposta'),h('b',{style:'font-size:17px'},rs.length?new Date(Math.max(...rs.map(r=>r.at))).toLocaleString('pt-BR'):'—'))),
      h('button',{class:'p',onclick:()=>exportXlsx(f,rs)},ic('download'),'Baixar Excel (.xlsx)'),h('div',{style:'height:14px'}));
    f.questions.forEach(q=>{
      const vs=rs.map(r=>(r.answers||{})[q.id]).filter(v=>v!=null&&v!==''&&!(Array.isArray(v)&&!v.length));
      const c=h('div',{class:'card'},h('h2',{},ic(T[q.type][1],'pri'),q.text),h('div',{class:'mut'},vs.length+' respostas'));
      const bar=(l,n)=>c.append(h('div',{class:'br'},h('span',{},String(l)),h('div',{class:'tr'},h('i',{style:'width:'+(vs.length?Math.round(100*n/vs.length):0)+'%'})),h('b',{},n+' · '+(vs.length?Math.round(100*n/vs.length):0)+'%')));
      if(['single','multi','yesno'].includes(q.type))q.options.forEach(o=>bar(o.t,vs.filter(v=>Array.isArray(v)?v.includes(o.t):v===o.t).length));
      else if(q.type==='scale'||q.type==='stars'){const n=vs.map(Number),lo=q.type==='scale'?0:1,hi=q.type==='scale'?10:5;
        if(n.length){c.append(h('div',{style:'font-size:28px;font-weight:800'},(n.reduce((a,b)=>a+b,0)/n.length).toFixed(1)+' ',h('span',{class:'mut'},'média')));
          if(q.type==='scale'){const nps=Math.round(100*(n.filter(x=>x>=9).length-n.filter(x=>x<=6).length)/n.length);c.append(h('div',{class:'tag'},'NPS '+nps))}}
        for(let k=lo;k<=hi;k++)bar(k,n.filter(x=>x===k).length)}
      else vs.slice(-6).reverse().forEach(v=>c.append(h('div',{class:'txt'},String(v))));
      body.append(c)});
  }
}
async function exportXlsx(f,rs){
  const rows=[...rs].sort((a,b)=>a.at-b.at).map(r=>{const o={'Data':new Date(r.at).toLocaleString('pt-BR')};f.questions.forEach(q=>{const v=(r.answers||{})[q.id];o[q.text]=Array.isArray(v)?v.join('; '):(v??'')});return o});
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows.length?rows:[{Data:''}]),'Respostas');
  XLSX.writeFile(wb,(f.title||'questionario').replace(/[^\w-]+/g,'_')+'.xlsx');
}

