export const $app=document.getElementById('app'),$top=document.getElementById('top');
export function h(t,a,...c){const e=document.createElement(t);for(const k in(a||{})){if(k.startsWith('on'))e.addEventListener(k.slice(2),a[k]);else if(k==='class')e.className=a[k];else e[k]=a[k]}c.flat().forEach(x=>e.append(x));return e}
export const ic=(n,c)=>h('span',{class:'ms '+(c||'')},n);
export const uid=()=>Math.random().toString(36).slice(2,10);
export const T={short:['Texto curto','short_text'],long:['Parágrafo','notes'],single:['Escolha única','radio_button_checked'],multi:['Múltipla escolha','check_box'],yesno:['Sim / Não','toggle_on'],scale:['Escala 0–10 (NPS)','speed'],stars:['Estrelas','star'],email:['E-mail','mail'],phone:['Telefone','call'],cpf:['CPF','badge'],number:['Número','pin'],date:['Data','calendar_month']};
export const PH={short:'Digite sua resposta…',long:'Digite sua resposta…',email:'nome@exemplo.com',phone:'(48) 99999-9999',cpf:'000.000.000-00',number:'0'};
export const HT={email:'email',number:'number',date:'date'};
export function norm(q){q.id=q.id||uid();q.options=(q.options||[]).map(o=>typeof o==='string'?{t:o}:o);
 if(q.type==='yesno'&&q.options.length!==2)q.options=[{t:'Sim'},{t:'Não'}];
 if((q.type==='single'||q.type==='multi')&&!q.options.length)q.options=[{t:'Opção 1'},{t:'Opção 2'}];return q}
export const TPL={blank:['Em branco','draft',()=>({title:'',questions:[]})],
nps:['Satisfação + NPS','sentiment_satisfied',()=>({title:'Pesquisa de satisfação',questions:[{type:'scale',text:'De 0 a 10, qual a chance de você nos recomendar?',required:true},{type:'stars',text:'Como você avalia nosso atendimento?',required:true},{type:'single',text:'O que mais pesou na sua nota?',options:['Preço','Qualidade','Atendimento','Outro']},{type:'long',text:'Como podemos melhorar?'}]})],
evt:['Inscrição em evento','event',()=>({title:'Inscrição no evento',questions:[{type:'short',text:'Qual é o seu nome?',required:true},{type:'email',text:'Qual o seu e-mail?',required:true},{type:'phone',text:'Telefone com DDD'},{type:'single',text:'Como conheceu o evento?',options:['Instagram','Amigos','E-mail','Outro']},{type:'yesno',text:'Você vai levar acompanhante?'}]})]};


export const go=p=>{history.pushState(null,'',p);window.dispatchEvent(new Event('popstate'))};
export const msg=(i,t,p)=>h('div',{class:'full'},h('div',{class:'blob'}),h('div',{class:'blob b2'}),h('div',{class:'shell',style:'grid-template-columns:1fr'},h('div',{class:'main'},h('div',{class:'stage'},ic(i,'big-ic'),h('h2',{class:'qt'},t),h('p',{class:'mut'},p||'')))));
