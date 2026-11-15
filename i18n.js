/* ================= idioma PT/EN (pedido da Laura, 15/11: "a navbar deve ter inglês e português") =================
   O site é escrito em português. O inglês vem de i18n-en.js (window.I18N_EN: texto em PT -> texto em EN) e é aplicado
   nos nós de texto e nos atributos legíveis (alt, aria-label, title). Conteúdo criado depois (modal, chaves) é
   traduzido ao entrar na página. A escolha fica salva; ?lang=en abre direto em inglês. */
(()=>{
  const EN=window.I18N_EN||{},ATR=['alt','aria-label','title','data-alt'],norm=t=>t.replace(/\s+/g,' ').trim();
  let lang='pt';try{lang=localStorage.getItem('lang')||'pt'}catch(e){}
  const q=new URLSearchParams(location.search).get('lang');if(q==='en'||q==='pt')lang=q;
  const pula=n=>{const p=n.parentElement;return !p||p.closest('script,style,noscript,#v8stub,[data-i18n-pula]')};
  const trNo=(n,para)=>{if(n.__pt===undefined){const k=norm(n.nodeValue);if(!k||!EN[k])return;n.__pt=n.nodeValue}
    const k=norm(n.__pt),m=n.__pt.match(/^(\s*)[\s\S]*?(\s*)$/),v=para==='en'?m[1]+EN[k]+m[2]:n.__pt;if(n.nodeValue!==v)n.nodeValue=v};
  const trEl=(el,para)=>{for(const a of ATR){if(!el.hasAttribute||!el.hasAttribute(a))continue;const ka='__pt_'+a;
    if(el[ka]===undefined){const v=norm(el.getAttribute(a));if(!EN[v])continue;el[ka]=el.getAttribute(a)}
    const v=para==='en'?EN[norm(el[ka])]:el[ka];if(el.getAttribute(a)!==v)el.setAttribute(a,v)}};
  const aplicaEm=(raiz,para)=>{if(raiz.nodeType===3){if(!pula(raiz))trNo(raiz,para);return}
    if(raiz.nodeType!==1||raiz.closest&&raiz.closest('script,style,#v8stub'))return;trEl(raiz,para);
    const w=document.createTreeWalker(raiz,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n;
    while((n=w.nextNode())){if(n.nodeType===3){if(!pula(n))trNo(n,para)}else trEl(n,para)}};
  let ocupado=false;
  const aplica=para=>{lang=para;ocupado=true;document.documentElement.lang=para==='en'?'en':'pt-BR';aplicaEm(document.body,para);
    if(EN.__title){document.__ptTitle=document.__ptTitle||document.title;document.title=para==='en'?(EN[norm(document.__ptTitle)]||document.__ptTitle):document.__ptTitle}
    document.querySelectorAll('.lang').forEach(b=>{b.setAttribute('aria-pressed',para==='en');b.setAttribute('aria-label','English')});
    ocupado=false};
  new MutationObserver(ms=>{if(ocupado||lang!=='en')return;ocupado=true;for(const m of ms){if(m.type==='characterData'){const n=m.target;if(n.__pt!==undefined&&norm(n.nodeValue)===norm(EN[norm(n.__pt)]||''))continue;n.__pt=undefined;trNo(n,'en')}else m.addedNodes.forEach(n=>aplicaEm(n,'en'))}ocupado=false})
    .observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  const liga=()=>{document.querySelectorAll('.lang').forEach(b=>b.addEventListener('click',()=>{const p=lang==='en'?'pt':'en';try{localStorage.setItem('lang',p)}catch(e){}
    document.documentElement.classList.add('troca-lang');setTimeout(()=>{aplica(p);document.documentElement.classList.remove('troca-lang')},180);window.somTocar&&window.somTocar('toggle',.4)}));
    aplica(lang)};
  document.readyState==='loading'?addEventListener('DOMContentLoaded',liga):liga();
})();
