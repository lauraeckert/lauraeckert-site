// Home v3: a mesma página da v2 (estrutura pedida pela Laura) com uma gramática de movimento só.
// Entradas expo.out, trocas power2.inOut; títulos por máscara de linha; fotos por clip-path, sempre nítidas;
// polaroides como pêndulo no clipe; GitHub real desenhado com a rolagem; Projetos estático (Akrus em destaque + showcase, sem pin nem placas:
// a parte frágil saiu em 14/11, "tá muito quebrado"); CTA conduzido pela rolagem.
// Alvo: ALVO-v3.md. Movimento reduzido: estado final, nada montado.
(()=>{
const RM=false; // pedido da Laura (15/11): o site não tem opção de desligar movimento
// CTA: opção B escolhida pela Laura (14/11): centralizado, com o jardim nascendo pela borda de baixo
const CTAV='c2';document.documentElement.dataset.cta=CTAV;
const DESK=matchMedia('(min-width:860px)').matches;
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
try{history.scrollRestoration='manual'}catch(e){}if(!location.hash)scrollTo(0,0); // reload abre no topo: a restauração no meio da página quebrava o ScrollTrigger (banca 15/11)
const G=window.gsap,ST=window.ScrollTrigger;if(G){G.ticker.lagSmoothing(0);if(ST){G.registerPlugin(ST);ST.clearScrollMemory&&ST.clearScrollMemory('manual');if(window.SplitText)G.registerPlugin(SplitText)}}
const fontsReady=document.fonts?document.fonts.ready:Promise.resolve();
const clamp=(a,b,v)=>Math.max(a,Math.min(b,v));

function specOf(type,seed){for(let s=seed;s<seed+5000;s++){const sp=flowerSpec(s,PAL_LIGHT);if(sp.type===type)return sp}return flowerSpec(seed,PAL_LIGHT)}
function fit(cv){const d=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;cv.width=Math.round(w*d);cv.height=Math.round(h*d);const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);return {x,w,h}}
const onScreen=el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight};

/* leque de flores saindo de um ponto. mode 'time': cresce quando start() é chamado; mode 'progress': cresce por setProgress(0..1) */
function spray(cv,anchors,mode='time'){let F=null,P=[],t0=Infinity,prog=RM?1:0,started=RM,raf=0;
  function build(){F=fit(cv);P=[];const r=rng(7);let k=0;
    for(const a of anchors(F.w,F.h)){a.list.forEach((it,i)=>{const sp=specOf(it.t,it.seed);Object.assign(sp,{lean:0,branch:it.br??false,buds:it.bud??1});
      sp.h=it.len/a.U;const s=wcSprite(sp,a.U);P.push({id:it.id,x:a.x,y:a.y,ang:a.flip?-it.ang*.8+.12:it.ang,len:it.len,s,ph:r()*6.28,delay:a.delay+i*110,ord:k++,amp:it.amp??.025,bend:0,bt:-1})})}
    RM?requestAnimationFrame(frame):loop()}
  function g(p,now){if(RM)return 1;if(mode==='progress'){const n=P.length||1;return clamp(0,1,(prog-p.ord/n*.45)/.55)}return clamp(0,1,(now-t0-p.delay)/1600)}
  function angle(p,now){let a=p.ang+(RM?0:Math.sin(now/1500+p.ph)*p.amp+Math.sin(now/610+p.ph*1.6)*p.amp*.3);
    if(p.bt>=0){const t=(now-p.bt)/1000;a+=p.bend*Math.exp(-3.2*t)*Math.cos(t*11);if(t>3)p.bt=-1}return a}
  function frame(now){raf=0;if(!F)return;F.x.clearRect(0,0,F.w,F.h);
    for(const p of P){const v=g(p,now);if(v<=0)continue;const e=1-Math.pow(1-v,3),a=angle(p,now);
      F.x.save();F.x.translate(p.x,p.y);F.x.rotate(a);if(v<1){const hh=p.s.H*e;F.x.beginPath();F.x.rect(-p.s.W,-hh,p.s.W*2,hh+2);F.x.clip()}
      F.x.drawImage(p.s.can,-p.s.gx,-p.s.H,p.s.W,p.s.H);F.x.restore()}
    if(!RM)loop()}
  function loop(){if(raf||RM)return;
    if(onScreen(cv))raf=requestAnimationFrame(frame);else raf=setTimeout(()=>{raf=0;loop()},250)}
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(build,200)});
  fontsReady.then(build);
  return {start(){if(!started){started=true;t0=performance.now()}},setProgress(v){prog=v},
    tip(id){const p=P.find(q=>q.id===id);if(!p)return null;const a=angle(p,performance.now());return {x:p.x+Math.sin(a)*p.len,y:p.y-Math.cos(a)*p.len}},
    bump(id,amt){const p=P.find(q=>q.id===id);if(p&&!RM){p.bend=amt;p.bt=performance.now()}}}}

/* ---------- 1 · hero ---------- */
const hero=$('.s-hero'),fl=$('.h-flores'),mold=$('.moldura');let heroSpray=null;
if(hero&&fl&&mold){
  heroSpray=spray(fl,(W,H)=>{const hr=hero.getBoundingClientRect(),m=mold.getBoundingClientRect(),mob=W<860;
    const L=m.left-hr.left,B=m.bottom-hr.top,mh=m.height,U=mob?20:Math.max(26,Math.min(40,W/40));
    return [{x:L+mh*.02+(mob?14:0),y:B,U,delay:0,flip:mob,list:[
      {t:'papoula',seed:4100,ang:-.52,len:(mob?.7:1)*(mh*.46),bud:1},{id:'daisy',t:'margarida',seed:2100,ang:mob?-.2:0,len:(mob?.7:1)*(mob?mh*.56:mh*.48),amp:.004},{t:'centaurea',seed:2300,ang:-.14,len:(mob?.7:1)*(mh*.44)},
      {t:'espiga',seed:2500,ang:-.7,len:(mob?.7:1)*(mh*.3)},{t:'botao',seed:2700,ang:.02,len:(mob?.7:1)*(mh*.28)},{t:'papoula',seed:4300,ang:-.3,len:(mob?.7:1)*(mh*.28),bud:0}]}]})} // o ramo da borda direita saiu (banca r4)

/* a joaninha da v8 entra voando numa curva, pousa na margarida e a margarida verga com o peso */
let bugGo=null;
const bugInit=()=>{const cv=$('.h-bug');if(!cv||!mold||typeof makeBug!=='function')return;window.FXD=window.FXD||[];let F=fit(cv);const P=makeBug({turn:-.4,fly:1,hold:true});
  const mob=()=>innerWidth<860,S=()=>mob()?64:96;let t0=RM?0:Infinity,landed=RM,bumped=false;
  const target=()=>{const tp=heroSpray&&heroSpray.tip('daisy');return tp?{x:tp.x,y:tp.y-(mob()?16:26)}:{x:F.w*.5,y:F.h*.5}};
  bugGo=()=>{if(t0===Infinity)t0=performance.now()};
  addEventListener('resize',()=>{F=fit(cv)});
  hero.addEventListener('click',e=>{if(e.target.closest('a'))return;if(landed&&typeof bugJump==='function')bugJump(P,.9)});
  let lastD=0;
  // pousada, a joaninha de pixel redesenha a 15 qps (desempenho, 15/11): cada quadro lê pixels da GPU
  window.FXD.push((_n,dt)=>{if(typeof vis==='function'&&!vis(cv))return;const now=performance.now();if(landed&&!RM&&now-lastD<66)return;dt=landed&&lastD?Math.min(4,(now-lastD)/16.67):dt;lastD=now;F.x.clearRect(0,0,F.w,F.h);if(now<t0)return;
    const k=RM?1:clamp(0,1,(now-t0)/2000),e=1-Math.pow(1-k,3),T=target();
    // curva de Bézier: entra pelo alto à direita, passa por cima da foto e desce na flor
    const sx=F.w+80,sy=-60,cx=F.w*.62,cy=F.h*.05;const u=1-e,x=u*u*sx+2*u*e*cx+e*e*T.x,y=u*u*sy+2*u*e*cy+e*e*T.y;
    if(k>=1&&!landed)landed=true;if(landed&&!bumped&&!RM){bumped=true;heroSpray&&heroSpray.bump('daisy',.09)}
    P.tg.fly=landed?0:1;P.fly=landed?0:1;P.tg.walking=0;P.tg.turn=landed?-.35:-.6;
    look(P,cv.getBoundingClientRect(),now);stepBug(P,dt,now);drawBug(F.x,P,x-S()/2,y-S()*.86,S(),{bg:'papel'})})};

/* ---------- títulos por máscara de linha (um padrão só) ---------- */
function splitLines(el){if(!window.SplitText||RM)return null;return SplitText.create(el,{type:'lines',mask:'lines',linesClass:'ln'})}

/* ---------- CTA: o buquê cresce com a rolagem ---------- */
const cf=$('.cta-flores');let ctaSpray=null;
if(cf){ctaSpray=spray(cf,(W,H)=>{const mob=W<860;
  if(CTAV==='b'){ // jardim: flores nascem pela borda de baixo, em grupos irregulares, com o centro baixo e livre em volta do botão
    const U=mob?18:30,out=[];
    const G=mob?[[.05,'margarida',.24,-.1],[.2,'papoula',.15,.2],[.42,'botao',.1,0],[.62,'centaurea',.13,-.15],[.8,'espiga',.22,.12],[.95,'papoula',.17,-.2]]
              :[[.025,'espiga',.34,.1],[.08,'margarida',.24,-.18],[.14,'papoula',.4,.08],[.21,'centaurea',.2,-.25],[.3,'botao',.15,.2],[.4,'margarida',.11,-.1],
                [.5,'centaurea',.08,0],[.6,'papoula',.12,.15],[.69,'espiga',.18,-.08],[.77,'margarida',.36,.22],[.84,'papoula',.26,-.12],[.91,'centaurea',.42,.06],[.975,'botao',.22,-.2]];
    G.forEach(([f,t,h,a],i)=>out.push({x:W*f+((i*37)%11-5),y:H,U,delay:0,flip:i%4===3,list:[{t,seed:5100+i*173,ang:a,len:H*h*(mob?1.2:1),bud:i%3?1:0}]}));return out}
  return []},'progress')}

/* ---------- GitHub: calendário real de contribuições ---------- */
let ghReady=null;
{const sv=$('.gh-grid'),tot=$('#gh-total');if(sv){ghReady=fetch('/github.json').then(r=>r.json()).then(d=>{
  const NS='http://www.w3.org/2000/svg',W=d.weeks.length,C=11,Gp=3;sv.setAttribute('viewBox',`0 0 ${W*(C+Gp)-Gp} ${7*(C+Gp)-Gp}`);
  const all=d.weeks.flat().filter(v=>v>0).sort((a,b)=>a-b),q=p=>all[Math.floor(all.length*p)]||1;
  const lv=v=>v===0?0:v<=q(.25)?1:v<=q(.5)?2:v<=q(.8)?3:4,col=['#2A251D','var(--azul-800)','var(--azul-600)','var(--azul-400)','var(--amarelo-300)'];
  const cols=[];d.weeks.forEach((w,i)=>{const g=document.createElementNS(NS,'g');w.forEach((v,j)=>{const r=document.createElementNS(NS,'rect');r.setAttribute('x',i*(C+Gp));r.setAttribute('y',j*(C+Gp));r.setAttribute('width',C);r.setAttribute('height',C);r.setAttribute('rx',2);r.setAttribute('fill',col[lv(v)]);g.append(r)});sv.append(g);cols.push(g)});
  tot.textContent=d.total.toLocaleString('pt-BR');return {cols,total:d.total,tot}}).catch(()=>{$('.gh')?.remove();return null})}}

/* ---------- botão magnético (mentoria e CTA): mola + preenchimento que nasce do ponto de entrada ---------- */
function magnetic(btn){if(!FINE||RM||!btn)return;const fill=document.createElement('span');fill.className='mg-fill';fill.setAttribute('aria-hidden','true');fill.innerHTML=btn.innerHTML;btn.append(fill);btn.classList.add('mg');
  // valores do Cofre (tools/creative-web/src/cofre/magnetic-button/CONTEXTO.md): raio 64, corpo 12·tanh(.3·dx/12)·queda, mola .16/.68
  const R=64,sat=(v)=>12*Math.tanh(.3*v/12);let x=0,y=0,vx=0,vy=0,tx=0,ty=0,raf=0;
  const tick=()=>{vx=(vx+(tx-x)*.16)*.68;vy=(vy+(ty-y)*.16)*.68;x+=vx;y+=vy;btn.style.transform=`translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;
    raf=(Math.abs(vx)+Math.abs(vy)+Math.abs(tx-x)+Math.abs(ty-y)>.05)?requestAnimationFrame(tick):0};
  const go=()=>{if(!raf)raf=requestAnimationFrame(tick)};
  addEventListener('pointermove',e=>{const r=btn.getBoundingClientRect(),cx=r.left+r.width/2-x,cy=r.top+r.height/2-y,dx=e.clientX-cx,dy=e.clientY-cy;
    const d=Math.max(0,Math.hypot(Math.max(0,Math.abs(dx)-r.width/2),Math.max(0,Math.abs(dy)-r.height/2)));
    const f=d<R?Math.pow(1-d/R,2):0;tx=sat(dx)*f;ty=sat(dy)*f;go()},{passive:true});
  const at=(e)=>{const r=btn.getBoundingClientRect();fill.style.setProperty('--mx',(e.clientX-r.left)+'px');fill.style.setProperty('--my',(e.clientY-r.top)+'px')};
  btn.addEventListener('pointerenter',e=>{at(e);btn.classList.add('on')});
  const rest=()=>{tx=ty=0;go()};
  btn.addEventListener('pointerleave',e=>{at(e);btn.classList.remove('on');rest()}); // recolhe para o ponto de saída
  document.documentElement.addEventListener('pointerleave',rest);addEventListener('scroll',rest,{passive:true});
  btn.addEventListener('focus',()=>{if(btn.matches(':focus-visible')){fill.style.setProperty('--mx','50%');fill.style.setProperty('--my','50%');btn.classList.add('on')}});
  btn.addEventListener('blur',()=>btn.classList.remove('on'))}
magnetic($('.btn-y'));magnetic($('.s-cta .btn-lg'));

/* rodapé: a logo (laura em cima, eckert embaixo), pequena, acima do jogo — pedido da Laura, 14/11.
   Clona o mesmo lettering que a v8 monta na navbar no load (sem duplicar desenho). */
/* rodapé (pedido da Laura, 14/11: "remova minha logo grande do footer, trabalhe nele"): sem a assinatura gigante;
   quatro colunas (marca, contato, páginas, redes) e o jogo dentro de um card pintado, como os projetos */
{const put=()=>{const src=document.querySelector('#nvLogo svg'),R=document.querySelector('#rodape'),grid=R&&R.querySelector('.ft-grid'),game=R&&R.querySelector('#game');
  if(!src||!grid||!game)return false;if(R.dataset.v3)return true;R.dataset.v3=1;
  const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h)e.innerHTML=h;return e};
  const marca=el('div','ft-marca'),a=el('a','ft-logo');a.href='#inicio';a.setAttribute('aria-label','laura eckert, voltar ao início');a.append(src.cloneNode(true));marca.append(a);
  const links=grid.querySelector('.ft-links'),pag=el('nav','ft-nav','<div class="ft-k ft-h3">Páginas</div>');pag.setAttribute('aria-label','Páginas');pag.append(links);
  const redes=el('nav','ft-nav','<div class="ft-k ft-h3">Redes</div><ul class="ft-links"><li><a href="https://www.instagram.com/eckertlaura_" target="_blank" rel="noopener">Instagram</a></li><li><a href="https://www.linkedin.com/in/eckertlaura" target="_blank" rel="noopener">LinkedIn</a></li><li><a href="https://www.youtube.com/@eckert_laura" target="_blank" rel="noopener">YouTube</a></li><li><a href="https://x.com/eckertlaura_" target="_blank" rel="noopener">X</a></li><li><a href="https://github.com/lauraeckert" target="_blank" rel="noopener">GitHub</a></li></ul>');
  redes.setAttribute('aria-label','Redes sociais');
  grid.prepend(marca);grid.append(pag,redes);
  const q=el('div','quadro ft-quadro','<canvas class="q-tinta" data-seed="9" aria-hidden="true"></canvas>');game.parentNode.insertBefore(q,game);q.append(game);
  const big=R.querySelector('#ftBig');big&&big.remove();
  // sem microtexto decorativo (memória sem-microtexto-em-lp): o e-mail fala por si; o relógio vira "Recife, 23:52"; a assinatura do © sai
  R.querySelectorAll('.ft-col .ft-k').forEach(k=>k.remove());
  const ck=R.querySelector('#ftClock');if(ck){const sp=el('span','ft-cidade','Recife');ck.parentNode.classList.add('ft-hora');ck.parentNode.insertBefore(sp,ck)}
  const cp=R.querySelector('.ft-bottom > span');if(cp)cp.textContent='© 2026 Laura Eckert';
  window.pintaQuadros&&window.pintaQuadros();return true};
 const tryPut=(n=0)=>{if(!put()&&n<40)setTimeout(()=>tryPut(n+1),100)};
 document.readyState==='complete'?tryPut():addEventListener('load',()=>tryPut(),{once:true})}

/* ---------- coreografia ---------- */
if(!G||!ST||RM){fontsReady.then(()=>setTimeout(()=>{bugInit();bugGo&&bugGo();heroSpray&&heroSpray.start()},30));ctaSpray&&ctaSpray.setProgress(1);return}
document.documentElement.classList.add('mo');

fontsReady.then(()=>{
  const k=DESK?1:.8;
  /* hero: corte de filme. moldura abre de baixo para cima → linhas do título → apoio → flores → pouso */
  const ht=$('.h-tit'),hs=window.HERO2?null:splitLines(ht);
  const tl=G.timeline({delay:.15,paused:!!window.HERO2});
  if(!window.HERO2)tl.fromTo(mold,{clipPath:'inset(100% 0% 0% 0% round 8px 8px 0 0)'},{clipPath:'inset(0% 0% 0% 0% round 8px 8px 0 0)',onComplete:()=>G.set(mold,{clearProps:'clipPath'}),duration:1*k,ease:'power4.inOut'},0)
    .fromTo(mold.querySelector('img'),{scale:1.12},{scale:1,duration:1.4*k,ease:'expo.out'},0)
    .from(hs?hs.lines:ht,{yPercent:110,duration:.9*k,stagger:.1,ease:'expo.out',onComplete:()=>hs&&hs.revert()},.35*k)
    .from($$('.h-who,.h-lead,.s-hero .btn'),{y:18,autoAlpha:0,duration:.8*k,stagger:.06,ease:'expo.out'},.7*k)
    .call(()=>heroSpray&&heroSpray.start(),null,.9*k)
    .call(()=>{bugInit();bugGo&&bugGo()},null,1.5*k);

  /* títulos de seção: sempre o mesmo gesto */
  {const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);try{const s=splitLines(e.target);if(s)G.from(s.lines,{yPercent:110,duration:.9,stagger:.08,ease:'expo.out',onComplete:()=>s.revert()})}catch(err){}}),{rootMargin:'0px 0px -10% 0px'});
   $$('#site h2').forEach(h=>{if(h.matches('#h-sobre,#h-proj,.sv-h,#h-ment,#h-cta')||h.closest('.hz'))return;io.observe(h)})}

  /* polaroides: pêndulo a partir do clipe, assentam nítidas */
  $$('#site .clip').forEach((c,i)=>{const rest=parseFloat(getComputedStyle(c).getPropertyValue('--rot'))||0;
    G.fromTo(c,{rotation:rest-(c.classList.contains('c3')?12:9),y:-28,autoAlpha:0},{rotation:rest,y:0,autoAlpha:1,duration:(DESK?1.5:1.1),ease:'elastic.out(1,.38)',delay:(i%2)*.15,
      scrollTrigger:{trigger:c.parentElement,start:'top 78%',once:true}})});

  /* experiência: o fio cresce, depois a linha */
  $$('#site .exp li').forEach(li=>{G.timeline({scrollTrigger:{trigger:li,start:'top 88%',once:true}}).fromTo(li,{'--fio':0},{'--fio':1,duration:.7,ease:'power2.inOut'}).from(li.children,{y:14,autoAlpha:0,duration:.7,stagger:.06,ease:'expo.out'},.15)});

  /* GitHub: as semanas se desenham com a rolagem; o total conta até o número real */
  ghReady&&ghReady.then(g=>{if(!g)return;const rects=g.cols;G.set(rects,{opacity:0});
    const n={v:0};G.to(n,{v:g.total,duration:1.1,ease:'expo.out',snap:{v:1},onUpdate:()=>g.tot.textContent=Math.round(n.v).toLocaleString('pt-BR'),scrollTrigger:{trigger:'.gh',start:'top 85%',once:true}});
    // a coluna é sticky: entrada única, semana a semana, em ordem cronológica
    if(DESK)G.to(rects,{opacity:1,ease:'none',stagger:{each:.02},scrollTrigger:{trigger:'.sobre-grid',start:'top 35%',end:'center 30%',scrub:.5}});
    else G.to(rects,{opacity:1,duration:.25,ease:'none',stagger:{amount:1},scrollTrigger:{trigger:'.gh',start:'top 88%',once:true}});
    ST.refresh()});

  /* fotos e telas: clip-path de baixo para cima, nítidas */
  /* cards: revelação por IntersectionObserver, sem ScrollTrigger. Um reload no meio da página quebrava o ScrollTrigger
     e deixava o card da Akrus preso em clip-path:inset(100%) (banca 15/11). O estado escondido só existe enquanto a
     animação roda; qualquer falha deixa o card visível. */
  {const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const f=e.target,rr=f.closest('.pk-destaque')?26:20,im=f.querySelector('img');
      try{G.fromTo(f,{clipPath:`inset(100% -80px -160px -80px round ${rr}px)`},{clipPath:`inset(0% -80px -160px -80px round ${rr}px)`,duration:1.2,ease:'expo.out',clearProps:'clipPath'});
        im&&G.fromTo(im,{scale:1.1},{scale:1,duration:1.4,ease:'expo.out',clearProps:'transform'})}catch(err){f.style.clipPath=''}}),{rootMargin:'0px 0px -12% 0px'});
   $$('#site .quadro').forEach(f=>io.observe(f))}
  $$('#site .sc,#site .pk-txt').forEach(t=>{const kids=t.matches('.sc')?$$('h3,p',t):[...t.children];if(!kids.length)return;G.from(kids,{y:16,autoAlpha:0,duration:.8,stagger:.06,ease:'expo.out',scrollTrigger:{trigger:t,start:'top 92%',once:true}})});

  /* CTA: o buquê cresce enquanto a pessoa chega; o título chega à maior escala da página */
  ST.create({trigger:'.s-cta',start:'top 90%',end:DESK?'center 55%':'top 25%',scrub:.6,onUpdate:s=>ctaSpray&&ctaSpray.setProgress(s.progress),onLeave:()=>ctaSpray&&ctaSpray.setProgress(1)});

  const mm=G.matchMedia();
  mm.add('(min-width:860px)',()=>{
    /* hero → saída em planos (sem pin) */
    if(!window.HERO2)G.timeline({scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}})
      .to('.h-txt',{yPercent:-40,scale:.94,transformOrigin:'0% 100%',ease:'none'},0)
      .to(mold,{yPercent:7,ease:'none'},0)
      .to([fl,'.h-bug'],{rotation:-4,yPercent:-6,transformOrigin:'30% 100%',ease:'none'},0);
    /* placas de seção e pin da Akrus removidos ("tá muito quebrado", 14/11): a seção de projetos é estática e robusta */
  });
  document.readyState==='complete'?ST.refresh():addEventListener('load',()=>ST.refresh(),{once:true});
});
})();

/* ---------- Projetos: cada mockup num card pintado (pedido da Laura, 14/11: "cada mockup dentro de um card com pintura")
   Campo florido pintado no próprio código com o motor de aquarela da v8 (nada de IA): sub-pintura em verdes, pinceladas
   diagonais em camadas quase transparentes, papoulas, centáureas e margaridas em toques, luz e granulação de tela.
   Cada card tem a sua semente; pinta uma vez quando chega perto da tela e repinta só se mudar muito de largura. */
(()=>{
  const C=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const V=['#3F5A35','#4E6A40','#5F7D4C','#6E8C58','#7A9862','#93AE78','#A9C58A','#6D8C7A','#56745F'];
  function dab(ctx,pts,col,r,L,a,v){const base=wcDeform(pts,2,v??.16,r);ctx.fillStyle=col;
    for(let i=0;i<L;i++){const p=wcDeform(base,1,.12,r);ctx.globalAlpha=a;ctx.beginPath();p.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}}
  const ell=(cx,cy,rx,ry,ang,n)=>{const p=[];n=n||9;const c=Math.cos(ang),s=Math.sin(ang);for(let i=0;i<n;i++){const t=i/n*6.2832,x=Math.cos(t)*rx,y=Math.sin(t)*ry;p.push([cx+x*c-y*s,cy+x*s+y*c])}return p};
  /* cada card com a sua cor (pedido da Laura, 14/11: "cada fundo com sua cor"), só com a paleta da marca:
     Akrus verde, Youbbe amarelo, Zouti laranja, LiqPay creme, Gassen noite, Century azul-claro */
  const TEMAS=[
    ()=>({base:'#4F6B42',dk:['#26402A','#2F4A2C','#3A5733'],md:['#4E6A40','#5F7D4C','#56745F','#6D8C7A','#6E8C58'],lt:['#7A9862','#93AE78','#A9C58A','#B9D09A','#C9DAB0'],
      ceu:['#C9DAE6','#E6EEF2','#D8E4EC'],luz:['#D6E6BF','#E9F1DA','#C3D8A6'],
      fl:[[C('--laranja-500'),C('--laranja-400'),C('--laranja-600'),C('--laranja-300')],[C('--azul-400'),C('--azul-300'),C('--azul-500'),C('--azul-200')],['#FFFDF6',C('--creme-100'),'#EEF3F8','#DCE7EE'],[C('--amarelo-300'),C('--amarelo-200')]]}),
    ()=>({base:C('--amarelo-300'),dk:[C('--amarelo-400'),C('--amarelo-500'),C('--amarelo-400')],md:[C('--amarelo-300'),C('--amarelo-200'),C('--amarelo-300'),C('--amarelo-400')],lt:[C('--amarelo-200'),C('--amarelo-100'),C('--amarelo-50'),C('--creme-50')],
      ceu:[C('--creme-50'),C('--amarelo-50'),C('--amarelo-100')],luz:[C('--amarelo-50'),C('--creme-50'),C('--amarelo-100')],
      fl:[[C('--laranja-500'),C('--laranja-600')],[C('--azul-600'),C('--azul-700')],[C('--creme-50'),C('--creme-100')],[C('--laranja-700')]],n:.6}),
    ()=>({base:C('--laranja-500'),dk:[C('--laranja-700'),C('--laranja-600'),C('--laranja-600')],md:[C('--laranja-500'),C('--laranja-400'),C('--laranja-500'),C('--laranja-600')],lt:[C('--laranja-300'),C('--laranja-200'),C('--laranja-100'),C('--laranja-400')],
      ceu:[C('--laranja-50'),C('--laranja-100'),C('--creme-50')],luz:[C('--laranja-100'),C('--laranja-50'),C('--creme-50')],
      fl:[[C('--creme-50'),C('--creme-100')],[C('--azul-900'),C('--azul-950')],[C('--amarelo-300'),C('--amarelo-200')],[C('--creme-50')]],n:.6}),
    ()=>({base:C('--creme-200'),dk:[C('--creme-400'),C('--creme-300'),C('--creme-500')],md:[C('--creme-200'),C('--creme-100'),C('--creme-300'),C('--creme-200')],lt:[C('--creme-50'),C('--creme-100'),C('--creme-50'),C('--creme-100')],
      ceu:[C('--creme-50'),C('--azul-50')],luz:[C('--creme-50'),C('--azul-50')],
      fl:[[C('--laranja-500'),C('--laranja-400'),C('--laranja-600')],[C('--azul-500'),C('--azul-400'),C('--azul-600')],[C('--amarelo-300'),C('--amarelo-400'),C('--amarelo-200')],[C('--azul-900'),C('--creme-600')]]}),
    ()=>({base:C('--azul-950'),dk:[C('--azul-950'),C('--azul-950'),C('--azul-900')],md:[C('--azul-950'),C('--azul-900'),C('--azul-900')],lt:[C('--azul-900'),C('--azul-800'),C('--azul-900')],
      ceu:[C('--azul-900'),C('--azul-800')],luz:[C('--azul-800'),C('--azul-900')],
      fl:[[C('--amarelo-300'),C('--amarelo-200'),C('--amarelo-400')],[C('--laranja-400'),C('--laranja-500'),C('--laranja-300')],[C('--creme-50'),C('--creme-100')],[C('--amarelo-100'),C('--creme-50')]]}),
    ()=>({base:C('--azul-300'),dk:[C('--azul-500'),C('--azul-400'),C('--azul-600')],md:[C('--azul-300'),C('--azul-200'),C('--azul-300'),C('--azul-400')],lt:[C('--azul-100'),C('--azul-50'),C('--azul-200'),C('--azul-100')],
      ceu:[C('--azul-50'),C('--creme-50')],luz:[C('--azul-50'),C('--creme-50')],
      fl:[[C('--laranja-500'),C('--laranja-400'),C('--laranja-600')],[C('--azul-800'),C('--azul-700'),C('--azul-900')],[C('--creme-50'),C('--creme-100')],[C('--amarelo-300'),C('--amarelo-200')]]})];
  // granulação: um ladrilho de ruído pintado uma vez e aplicado por cima (antes era getImageData no card inteiro)
  let GRAO;const grao=()=>{if(GRAO)return GRAO;const c=document.createElement('canvas');c.width=c.height=192;const x=c.getContext('2d'),im=x.createImageData(192,192),d=im.data,r=rng(77);
    for(let i=0;i<d.length;i+=4){const v=r()<.5?0:255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=Math.round(r()*22)}x.putImageData(im,0,0);return GRAO=c};
  // a pintura roda em fatias de ~6 ms por quadro (desempenho, 15/11): nada de tarefa longa travando a rolagem
  const FILA=[];let rodando=false;
  function bombear(){const t0=performance.now(),lim=document.documentElement.classList.contains('pm-aberto')?14:6;while(FILA.length&&performance.now()-t0<lim){const j=FILA[0];if(j.it.next().done)FILA.shift()}
    if(FILA.length)requestAnimationFrame(bombear);else rodando=false}
  function pinta(cv,seed,esc){const box=cv.parentNode.getBoundingClientRect();if(!box.width)return;cv._w=box.width;
    const i=FILA.findIndex(j=>j.cv===cv);if(i>=0)FILA.splice(i,1);
    FILA.push({cv,it:pintaG(cv,seed,box,esc||1)});if(!rodando){rodando=true;requestAnimationFrame(bombear)}}
  function* pintaG(cv,seed,box,esc){
    const k=Math.min(devicePixelRatio||1,1.25)*(esc||1),W=Math.min(1400,Math.round(box.width*k)),H=Math.round(W*box.height/box.width);
    const off=document.createElement('canvas');off.width=W;off.height=H;
    const ctx=off.getContext('2d'),r=rng(seed*2654435761+17),U=W/100,HU=H/100,R=(a,b)=>a+r()*(b-a),UF=Math.max(U,7.5*k),Q=Math.min(1,(U/UF)**2);
    const T=TEMAS[(seed-3)%TEMAS.length](),DK=T.dk,MD=T.md,LT=T.lt;
    const pick=a=>a[Math.floor(r()*a.length)];
    // ponto perto da borda (o centro fica sob o mockup): as flores e a luz se juntam na moldura, como na referência
    const borda=()=>{const s=Math.floor(r()*4),t=r();const m=R(0,13);return s===0?[t*100*U,m*HU]:s===1?[t*100*U,(100-m)*HU]:s===2?[m*U,t*100*HU]:[(100-m)*U,t*100*HU]};
    const dir=-.75+R(-.15,.15);
    ctx.fillStyle=T.base;ctx.fillRect(0,0,W,H);
    // sub-pintura: massas de sombra e de luz e respiros de céu, pintadas nítidas numa camada e desfocadas uma vez só
    const sub=document.createElement('canvas');sub.width=W;sub.height=H;const sx=sub.getContext('2d');
    for(let i=0;i<60;i++){dab(sx,ell(R(-5,105)*U,R(-5,105)*HU,R(8,24)*U,R(5,13)*U,dir+R(-.5,.5),10),pick(r()<.4?DK:r()<.7?MD:LT),r,4,.22,.22);if(i%10===9)yield}
    for(let i=0;i<7;i++){const [x,y]=borda();dab(sx,ell(x,y,R(4,9)*U,R(2,5)*U,dir+R(-.4,.4),10),pick(T.ceu),r,5,.22,.24)}
    yield;ctx.filter=`blur(${Math.round(U*(U<UF?.6:1.2))}px)`;ctx.drawImage(sub,0,0);ctx.filter='none';yield;
    // pinceladas: folhas e capim na diagonal, em três passadas (sombra, meio-tom, luz)
    const N=Math.round(900*(W*H)/(1400*875)*Q);
    for(const [pal,a,f] of [[DK,.26,.35],[MD,.24,.45],[LT,.22,.2]])for(let i=0;i<N*f;i++){const cx=R(-4,104)*U,cy=R(-4,104)*HU,len=R(2.5,9)*UF,wd=R(.6,1.9)*UF,an=dir+R(-.7,.7);
      const p=wcPetal(len,wd,10).map(([x,y])=>[x,y+len/2]);dab(ctx,wcRot(p,an+1.5708,cx,cy),pick(pal),r,3,a,.12);if(i%25===24)yield}
    // flores em toques, em grupos na moldura
    const grupo=(cols,n,rad,sz)=>{const [gx,gy]=borda();for(let i=0;i<n;i++){const x=gx+R(-rad,rad)*UF,y=gy+R(-rad,rad)*UF*.7,s=R(sz[0],sz[1])*UF;
        dab(ctx,ell(x,y,s,s*R(.5,.85),dir+R(-.6,.6),9),pick(cols),r,6,.2,.28);
        if(r()<.5)dab(ctx,ell(x+s*.25,y-s*.2,s*.45,s*.3,R(0,3),7),'#FFFFFF',r,3,.12,.3)}};
    const G=Math.max(.45,Q)*(T.n||1);let j=0;
    for(const [n,c,rad,sz] of [[9,[4,9],[3,8],[.9,2.6]],[7,[3,7],[3,7],[.7,2]],[8,[3,8],[3,8],[.5,1.7]],[3,[2,4],[2,4],[.4,1]]]){for(let g=0;g<n*(j<3?G:1);g++){grupo(T.fl[j],Math.round(R(c[0],c[1])),R(rad[0],rad[1]),sz);yield}j++}
    // luz por cima: pinceladas curtas e claras, quase transparentes
    for(let i=0;i<N*.12;i++){const [x,y]=r()<.7?borda():[R(0,100)*U,R(0,100)*HU],len=R(1.5,4)*UF,an=dir+R(-.5,.5);
      dab(ctx,wcRot(wcPetal(len,R(.3,.8)*UF,8),an+1.5708,x,y),pick(T.luz),r,2,.3,.1);if(i%25===24)yield}
    // granulação da tela
    ctx.globalAlpha=1;ctx.globalCompositeOperation='overlay';ctx.fillStyle=ctx.createPattern(grao(),'repeat');ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
    // troca de uma vez: o card nunca aparece pela metade
    cv.width=W;cv.height=H;cv.getContext('2d').drawImage(off,0,0)}
  const sd=c=>+c.dataset.seed||[...document.querySelectorAll('#site .q-tinta')].indexOf(c)+3;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!e.target._w)pinta(e.target,sd(e.target))}),{rootMargin:'800px 0px'});
  (window.pintaQuadros=()=>document.querySelectorAll('.q-tinta').forEach(c=>{if(!c._obs){c._obs=1;io.observe(c)}}))();
  // o modal pinta na hora, na frente da fila (banca 15/11: no desktop a aquarela ficava esperando os cards)
  window.pintaJa=(c,seed)=>{if(!c.parentNode)return;const t=()=>{if(!c.isConnected)return;if(!c.parentNode.getBoundingClientRect().width)return requestAnimationFrame(t);pinta(c,seed,.5);c._w=1;const i=FILA.findIndex(j=>j.cv===c);if(i>0)FILA.unshift(FILA.splice(i,1)[0]);const pronto=()=>{if(!c.isConnected)return;if(c.width!==300)c.classList.add('pintado');else requestAnimationFrame(pronto)};pronto()};t()};
  let tm;addEventListener('resize',()=>{clearTimeout(tm);tm=setTimeout(()=>document.querySelectorAll('.q-tinta').forEach(c=>{if(c._w&&Math.abs(c.parentNode.getBoundingClientRect().width-c._w)>c._w*.2)pinta(c,sd(c))}),250)});
})();

/* desempenho (15/11): o jardim do Sobre e o cenário do jogo pintam dezenas de aquarelas; antes isso acontecia no
   primeiro quadro, travando a entrada da hero. Agora pintam quando o navegador fica ocioso, depois da entrada. */
addEventListener('load',()=>{const idle=window.requestIdleCallback||(f=>setTimeout(f,1));window.WCQ=.5;
  setTimeout(()=>idle(()=>{try{if(typeof meadowLayer==='function'&&!gMeadow)gMeadow=meadowLayer()}catch(e){}
    setTimeout(()=>idle(()=>{try{if(typeof gameScene==='function'&&!gScene)gScene=gameScene()}catch(e){}},{timeout:1500}),400)},{timeout:1500}),1600)},{once:true});

/* ================= LP 15/11: Serviços, CTA em caracteres e mais motion (pedido da Laura: "quero a página com mais efeitos de motion") ================= */
(()=>{
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const RMq=false,FINEq=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const G=window.gsap,ST=window.ScrollTrigger;

  /* ---------- Serviços: uma coluna aberta por vez; hover com intenção no desktop, toque e teclado em qualquer tela ---------- */
  const svs=$$('.sv');
  const abrir=(li,anim=true)=>{if(li.classList.contains('is-on'))return;
    svs.forEach(o=>{const on=o===li;o.classList.toggle('is-on',on);o.querySelector('.sv-tab').setAttribute('aria-expanded',on)});
    if(G&&!RMq&&anim){const p=li.querySelector('.sv-p');G.fromTo(p.querySelectorAll('.sv-l li, .sv-txt p'),{x:-18,autoAlpha:0},{x:0,autoAlpha:1,duration:.7,stagger:.05,ease:'expo.out',delay:.3});
      G.fromTo(p.querySelector('.sv-img'),{clipPath:'inset(0 0 100% 0 round 12px)'},{clipPath:'inset(0 0 0% 0 round 12px)',duration:.9,ease:'expo.inOut',delay:.12,clearProps:'clipPath'});
      G.fromTo(p.querySelector('.sv-img img'),{scale:1.15},{scale:1,duration:1.2,ease:'expo.out',delay:.12})}
    ST&&setTimeout(()=>ST.refresh(),760)};
  svs.forEach(li=>{const b=li.querySelector('.sv-tab');let t;
    b.addEventListener('click',()=>abrir(li));
    });  // só clique/toque/teclado: a largura muda e o hover abriria a coluna vizinha (banca 15/11)

  /* ---------- rodapé: redes em ícone, iguais às do Sobre ---------- */
  const putSoc=()=>{const nav=$$('#rodape .ft-nav')[1];if(!nav)return false;const ul=nav.querySelector('ul.ft-links');if(!ul)return true;
    const src=$('.soc-sobre');if(!src)return true;const c=src.cloneNode(true);c.classList.remove('soc-sobre');c.classList.add('soc-ft');c.querySelectorAll('[style]').forEach(e=>e.removeAttribute('style'));ul.replaceWith(c);return true};
  const tryS=(n=0)=>{if(!putSoc()&&n<50)setTimeout(()=>tryS(n+1),120)};addEventListener('load',()=>tryS(),{once:true});

  /* ---------- CTA: flores da aquarela redesenhadas em caracteres (como a referência), crescem com a rolagem e reagem ao cursor ---------- */
  const cv=$('.cta2-art');
  if(cv&&typeof wcSprite==='function'){
    let base=null,cells=null,CW=9,ctx=cv.getContext('2d'),W=0,H=0,prog=RMq?1:0,ready=false;
    const CH=' .:-=+*#%$@';
    const seedFor=(type,from)=>{for(let s=from;s<from+4000;s++)if(flowerSpec(s,PAL_LIGHT).type===type)return s;return from};
    function build(){const r=cv.getBoundingClientRect();if(!r.width)return;const k=Math.min(devicePixelRatio||1,2);W=Math.round(r.width*k);H=Math.round(r.height*k);cv.width=W;cv.height=H;CW=Math.round((innerWidth<860?7:9)*k);
      // pinta as flores numa tela de amostra (só a forma e a cor; o caractere vem da luminância)
      const src=document.createElement('canvas');src.width=W;src.height=H;const sx=src.getContext('2d');
      const U=H/(innerWidth<860?11:13);
      [['papoula',.6,1,-.12],['centaurea',.3,.8,.16],['margarida',.86,.7,.08]].forEach(([t,fx,fh,lean],i)=>{
        const sp=flowerSpec(seedFor(t,800+i*97),PAL_LIGHT);sp.h=(H/U)*fh*.92;sp.lean=lean;const s=wcSprite(sp,U);
        sx.drawImage(s.can,fx*W-s.gx,H-s.H,s.W,s.H)});
      const d=sx.getImageData(0,0,W,H).data,cols=Math.ceil(W/CW),rows=Math.ceil(H/CW);cells=[];
      for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x=Math.min(W-1,i*CW+(CW>>1)),y=Math.min(H-1,j*CW+(CW>>1)),p=(y*W+x)*4,a=d[p+3]/255;if(a<.18)continue;
        const L=(.299*d[p]+.587*d[p+1]+.114*d[p+2])/255;cells.push({x:i*CW,y:j*CW,c:`rgb(${d[p]},${d[p+1]},${d[p+2]})`,g:CH[Math.max(1,Math.min(CH.length-1,Math.round((1-L*.6)*a*(CH.length-1))))]})}
      base=document.createElement('canvas');base.width=W;base.height=H;const bx=base.getContext('2d');bx.font=`${CW*1.15}px Monocraft, monospace`;bx.textBaseline='top';
      for(const c of cells){bx.fillStyle=c.c;bx.fillText(c.g,c.x,c.y)}
      ready=true;draw()}
    // revela de baixo para cima conforme a rolagem
    function draw(){if(!ready)return;ctx.clearRect(0,0,W,H);const top=H*(1-prog);ctx.save();ctx.beginPath();ctx.rect(0,top,W,H-top);ctx.clip();ctx.drawImage(base,0,0);ctx.restore()}
    // cursor: os caracteres perto dele embaralham em amarelo e voltam
    const sujos=new Map();let raf=0;
    const tick=()=>{raf=0;const now=performance.now();ctx.font=`${CW*1.15}px Monocraft, monospace`;ctx.textBaseline='top';
      for(const [c,t] of sujos){ctx.clearRect(c.x,c.y,CW,CW);if(c.y<H*(1-prog))continue;if(now>t){ctx.fillStyle=c.c;ctx.fillText(c.g,c.x,c.y);sujos.delete(c)}else{ctx.fillStyle=Math.random()<.5?'#FFA200':'#F4EBD3';ctx.fillText(CH[1+Math.floor(Math.random()*(CH.length-1))],c.x,c.y)}}
      if(sujos.size)raf=requestAnimationFrame(tick)};
    if(FINEq&&!RMq)cv.parentNode.addEventListener('pointermove',e=>{if(!ready)return;const r=cv.getBoundingClientRect(),k=W/r.width,mx=(e.clientX-r.left)*k,my=(e.clientY-r.top)*k,R=70*k,now=performance.now();
      if(mx<-R||mx>W+R)return;for(const c of cells){const dx=c.x-mx,dy=c.y-my;if(dx*dx+dy*dy<R*R)sujos.set(c,now+180+Math.random()*420)}if(!raf)raf=requestAnimationFrame(tick)});
    const io=new IntersectionObserver(es=>{if(es[0].isIntersecting&&!base){io.disconnect();(window.requestIdleCallback?requestIdleCallback(()=>build(),{timeout:700}):setTimeout(build,1))}},{rootMargin:'1200px 0px'});io.observe(cv);
    let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(base)build()},300)});
    if(G&&ST&&!RMq)ST.create({trigger:'.cta2',start:'top 85%',end:'top 15%',scrub:.6,onUpdate:s=>{prog=s.progress;draw()},onLeave:()=>{prog=1;draw()}});
  }

  if(!G||!ST||RMq)return;
  /* ---------- títulos de seção: letras sobem por máscara ---------- */
  const chars=el=>{if(!el||!window.SplitText)return null;return SplitText.create(el,{type:'chars,words',mask:'chars',charsClass:'ch'})};
  // títulos de seção por letra; disparo por IntersectionObserver para nunca ficarem presos escondidos (pedido 15/11: "cadê os titles")
  document.fonts.ready.then(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const el=e.target;
      try{const sp=chars(el);if(!sp)return;G.from(sp.chars,{yPercent:110,duration:1,stagger:.025,ease:'expo.out',onComplete:()=>sp.revert()})}catch(err){}}),{rootMargin:'0px 0px -10% 0px'});
    ['#h-sobre','#h-proj','.sv-h','#h-ment'].forEach(s=>{const el=$(s);el&&io.observe(el)})});
  // CTA: as três linhas sobem uma a uma e o destaque se acende
  const l2=$$('.c2-l');if(l2.length){G.from(l2,{yPercent:100,autoAlpha:0,duration:1.1,stagger:.12,ease:'expo.out',scrollTrigger:{trigger:'.cta2',start:'top 70%',once:true}});
    G.from('.cta2-mail',{y:20,autoAlpha:0,duration:.9,ease:'expo.out',delay:.4,scrollTrigger:{trigger:'.cta2',start:'top 70%',once:true}})}
  // Serviços: o título grande desliza com a rolagem; colunas entram em sequência
  G.fromTo('.sv-h',{xPercent:4},{xPercent:-3,ease:'none',scrollTrigger:{trigger:'.s-serv',start:'top bottom',end:'bottom top',scrub:.6}});
  G.from('.sv',{y:40,autoAlpha:0,duration:.9,stagger:.07,ease:'expo.out',scrollTrigger:{trigger:'.sv-row',start:'top 85%',once:true}});
  // redes: entram em cascata
  G.from('.soc-sobre li',{scale:.4,autoAlpha:0,duration:.7,stagger:.05,ease:'back.out(2)',scrollTrigger:{trigger:'.soc-sobre',start:'top 92%',once:true}});
  /* ---------- projetos: a pintura respira em paralaxe dentro do card e o card inclina com o cursor ---------- */
  $$('#site .quadro .q-tinta').forEach(c=>{G.set(c,{scale:1.12});G.fromTo(c,{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:c.parentNode,start:'top bottom',end:'bottom top',scrub:.5}})});
  if(FINEq)$$('#site .quadro').forEach(q=>{G.set(q,{transformPerspective:1200});const rx=G.quickTo(q,'rotationX',{duration:.6,ease:'power3'}),ry=G.quickTo(q,'rotationY',{duration:.6,ease:'power3'});
    q.addEventListener('pointermove',e=>{const r=q.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;rx(-y*5);ry(x*6)});
    q.addEventListener('pointerleave',()=>{rx(0);ry(0)})});
})();

/* ================= HERO 2 (15/11, "quero algo mais diferente, nível Awwwards", referência budarina) =================
   Título gigante no centro; o campo de flores da aquarela nasce do chão em duas camadas, atrás e na frente das letras;
   a foto da Laura é uma polaroide no meio das flores; a joaninha pousa numa margarida. As flores se afastam do cursor
   (vento), as camadas se separam em paralaxe com o mouse e com a rolagem. */
window.HERO2=true;
(()=>{
  const hero=document.querySelector('.hz');if(!hero||typeof wcSprite!=='function')return;
  const G=window.gsap,ST=window.ScrollTrigger,FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const back=hero.querySelector('.hz-back'),front=hero.querySelector('.hz-front'),bugC=hero.querySelector('.hz-bug'),foto=hero.querySelector('.hz-foto');
  const cl=(a,b,v)=>Math.max(a,Math.min(b,v)),ease=t=>1-Math.pow(1-t,3);
  const spec=(type,seed)=>{for(let s=seed;s<seed+5000;s++){const sp=flowerSpec(s,PAL_LIGHT);if(sp.type===type)return sp}return flowerSpec(seed,PAL_LIGHT)};
  let W=0,H=0,mob=false,L={back:null,front:null},plants=[],t0=0,mx=-9e3,my=-9e3,vis=true;
  // composição: [camada, tipo, x (0–1), altura (fração da hero), inclinação, semente, id]
  // composição (banca r10): poucas flores em três tamanhos. [camada, tipo, x, altura, inclinação, semente, id, escala]
  // grandes na frente sangrando pelo pé e encostando na base das letras; médias atrás do título; pequenas ao fundo.
  // As cabeças ficam fora das letras ou atrás delas: o título continua legível.
  const COMP_D=[
    ['back','graminea',.03,.3,.14,5300,0,1],['back','botao',.19,.36,-.1,5600,0,1],['back','espiga',.37,.4,.08,5100,0,1],['back','botao',.64,.38,.12,5650,0,1],['back','graminea',.93,.32,-.16,5900,0,1],
    ['back','papoula',.3,.6,-.05,5200,0,1.55],['back','espiga',.53,.7,.04,5700,0,1.4],['back','papoula',.7,.58,.07,5800,0,1.5],['back','margarida',.86,.7,-.04,5500,'daisy',1.3],
    ['front','papoula',.035,.34,-.1,6100,0,2.4],['front','papoula',.4,.07,-.06,6400,0,2.2],['front','papoula',.545,.17,.05,6250,0,1.9],['front','centaurea',.66,.05,.12,6200,0,1.8],['front','papoula',.7,.03,-.14,6450,0,1.9],['front','margarida',.975,.42,-.16,6300,0,2.1]];
  const COMP_M=[
    ['back','botao',.12,.34,-.1,5600,0,1],['back','espiga',.88,.4,.1,5100,0,1],
    ['back','papoula',.3,.56,-.06,5200,0,1.5],['back','margarida',.8,.4,.04,5500,'daisy',1.3],
    ['front','papoula',.08,.3,.18,6100,0,2.2],['front','centaurea',.52,.2,-.1,6200,0,2],['front','papoula',.97,.1,-.2,6400,0,2]];
  const fit=cv=>{const d=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;cv.width=Math.round(w*d);cv.height=Math.round(h*d);const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);return {x,w,h}};
  // as aquarelas são pintadas uma por quadro, a planta nasce assim que a sua fica pronta
  function build(){L.back=fit(back);L.front=fit(front);W=L.front.w;H=L.front.h;mob=W<860;plants=[];
    const U=mob?Math.max(13,W/30):Math.max(20,Math.min(42,W/40)),comp=mob?COMP_M:COMP_D,r=rng(31);
    comp.forEach(([layer,t,fx,fh,ang,seed,id,k],i)=>plants.push({layer,t,seed,id,x:fx*W,y:H+4,ang,len:fh*H,U:U*(k||1),big:(k||1)>1.9,ph:r()*6.28,delay:i*80+(layer==='front'?300:0),s:null,bend:0,bv:0}));
    let i=0;const paint=()=>{const p=plants[i++];if(!p)return;const sp=spec(p.t,p.seed);Object.assign(sp,{lean:0,branch:false,buds:1});sp.h=p.len/p.U;const q=window.WCQ;window.WCQ=p.big?.55:.7;p.s=wcSprite(sp,p.U);window.WCQ=q;requestAnimationFrame(paint)};paint()}
  const tipOf=p=>{const a=p.ang+p.bend+Math.sin(performance.now()/1500+p.ph)*.02;return {x:p.x+Math.sin(a)*p.len,y:p.y-Math.cos(a)*p.len}};
  function frame(now){if(!vis||!L.front){requestAnimationFrame(frame);return}
    for(const k of ['back','front']){const F=L[k];F.x.clearRect(0,0,F.w,F.h)}
    for(const p of plants){if(!p.s)continue;if(!p.born)p.born=now+p.delay;const g=cl(0,1,(now-p.born)/1700);if(g<=0)continue;const e=ease(g);
      // vento: o cursor empurra a flor para longe (mola amortecida)
      const tip=tipOf(p),dx=tip.x-mx,dy=tip.y-my,d=Math.hypot(dx,dy),R=mob?0:(p.big?320:220),push=d<R?(1-d/R)*(dx>=0?1:-1)*(p.big?.12:.26):0;
      p.bv+=(push-p.bend)*.06;p.bv*=.86;p.bend+=p.bv;
      if(push&&!p.rang&&window.somTocar){p.rang=1;window.somTocar('select',.25)}if(!push)p.rang=0;
      const a=p.ang+p.bend+Math.sin(now/1500+p.ph)*.02+Math.sin(now/610+p.ph*1.6)*.006,F=L[p.layer].x,s=p.s;
      F.save();F.translate(p.x,p.y);F.rotate(a);if(g<1){const hh=s.H*e;F.beginPath();F.rect(-s.W,-hh,s.W*2,hh+2);F.clip()}F.drawImage(s.can,-s.gx,-s.H,s.W,s.H);F.restore()}
    requestAnimationFrame(frame)}
  hero.addEventListener('pointermove',e=>{const r=front.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});
  hero.addEventListener('pointerleave',()=>{mx=my=-9e3});
  new IntersectionObserver(es=>{vis=es[0].isIntersecting},{rootMargin:'100px'}).observe(hero);
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{const old=plants;build();plants.forEach(p=>p.born=1)},250)});

  /* a joaninha voa de cima à direita numa curva e pousa na margarida da frente; pousada, redesenha a 15 qps */
  function bug(){if(!bugC||typeof makeBug!=='function')return;let F=fit(bugC);addEventListener('resize',()=>{F=fit(bugC)});
    const P=makeBug({turn:-.4,fly:1,hold:true}),S=()=>mob?60:96;let tb=performance.now(),landed=false,last=0;
    hero.addEventListener('click',e=>{if(e.target.closest('a,button'))return;if(landed&&typeof bugJump==='function'){bugJump(P,.9);window.somTocar&&window.somTocar('tap')}});
    window.FXD=window.FXD||[];window.FXD.push((_n,dt)=>{if(!vis)return;const now=performance.now();if(landed&&now-last<66)return;dt=landed&&last?Math.min(4,(now-last)/16.67):dt;last=now;
      F.x.clearRect(0,0,F.w,F.h);const d=plants.find(p=>p.id==='daisy');if(!d||!d.s)return;
      const T=tipOf(d),k=cl(0,1,(now-tb)/2200),e=ease(k),sx=F.w+80,sy=-80,cx=F.w*.7,cy=F.h*.08,u=1-e;
      const x=u*u*sx+2*u*e*cx+e*e*T.x,y=u*u*sy+2*u*e*cy+e*e*(T.y-(mob?14:24));
      if(k>=1&&!landed){landed=true;d.bv-=.05;window.somTocar&&window.somTocar('toggle',.5)}
      P.tg.fly=landed?0:1;P.fly=landed?0:1;P.tg.walking=0;P.tg.turn=landed?-.35:-.6;look(P,bugC.getBoundingClientRect(),now);stepBug(P,dt,now);drawBug(F.x,P,x-S()/2,y-S()*.86,S(),{bg:'papel'})})}

  const go=()=>{build();requestAnimationFrame(frame);setTimeout(bug,1400)};
  (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{
    go();if(!G)return;
    const tit=hero.querySelector('.hz-tit');let sp=null;if(window.SplitText)sp=SplitText.create(tit,{type:'chars,words',mask:'chars'});
    const tl=G.timeline({delay:.1});
    if(sp)tl.from(sp.chars,{yPercent:115,duration:1.2,stagger:.035,ease:'expo.out',onComplete:()=>sp.revert()},0);
    tl.fromTo(foto,{y:-260,rotation:-18,autoAlpha:0},{y:0,rotation:6,autoAlpha:1,duration:1.4,ease:'elastic.out(1,.55)'},.5)
      .from(hero.querySelectorAll('.hz-pe > *'),{y:22,autoAlpha:0,duration:.9,stagger:.07,ease:'expo.out'},.9);
    // paralaxe do mouse: as camadas se separam em profundidade
    if(FINE){const q=(el,p)=>({x:G.quickTo(el,'x',{duration:.9,ease:'power3'}),y:G.quickTo(el,'y',{duration:.9,ease:'power3'}),p});
      const layers=[q(back,-10),q(tit,6),q(foto,14),q(front,22)];
      hero.addEventListener('pointermove',e=>{const nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;layers.forEach(l=>{l.x(nx*l.p);l.y(ny*l.p*.5)})})}
    // rolagem: o título recua, as flores da frente sobem mais rápido que as de trás
    if(ST)G.timeline({scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}})
      .to(tit,{yPercent:-28,scale:.9,ease:'none'},0).to(front,{yPercent:-16,ease:'none'},0).to(back,{yPercent:-4,ease:'none'},0)
      .to(foto,{yPercent:-40,rotation:14,ease:'none'},0).to(bugC,{yPercent:-16,ease:'none'},0);
  });
})();

/* ================= Mentoria em pastas retrô com post-its + botão de som (15/11) ================= */
(()=>{
  const G=window.gsap,$$=(s,r=document)=>[...r.querySelectorAll(s)];
  /* ---------- som: Cuelume (MIT, Web Audio sintetizado, sem arquivos), começa desligado; a escolha fica salva ---------- */
  let cue=null,on=false;const btn=document.querySelector('.som');
  const lerPref=()=>{try{return localStorage.getItem('som')==='1'}catch(e){return false}},salvar=v=>{try{localStorage.setItem('som',v?'1':'0')}catch(e){}};
  const carregar=()=>cue?Promise.resolve(cue):import('https://cdn.jsdelivr.net/npm/cuelume@0.2.8/+esm').then(m=>{cue=m;m.setVolume&&m.setVolume(.55);return m}).catch(()=>null);
  let lastT=0;window.somTocar=(name,vol)=>{if(!on||!cue)return;const n=performance.now();if(n-lastT<45)return;lastT=n;try{cue.play(name,vol?{volume:vol}:undefined)}catch(e){}};
  const marcar=()=>{ // atributos declarativos da Cuelume nos controles da página
    $$('#nvLinks a,.ft-nav a,.btn,.cta2-mail').forEach(a=>a.setAttribute('data-cuelume-navigate',''));
    $$('.sv-tab').forEach(b=>b.setAttribute('data-cuelume-open',''));
    $$('.pasta-aba').forEach(b=>b.setAttribute('data-cuelume-select',''));
    $$('.soc a,.pk-destaque,.pm-nav,.pm-link').forEach(a=>a.setAttribute('data-cuelume-tap',''));$$('.sc-abre').forEach(b=>b.setAttribute('data-cuelume-open',''));$$('.pm-fechar').forEach(b=>b.setAttribute('data-cuelume-tap',''))};
  const aplicar=v=>{on=v;salvar(v);if(btn){btn.setAttribute('aria-pressed',v);btn.querySelector('.som-t').textContent=v?'Som ligado':'Som desligado'}
    if(v)carregar().then(m=>{if(!m)return;m.unlock&&m.unlock();m.setEnabled&&m.setEnabled(true);marcar();if(!m._b){m.bind&&m.bind();m._b=1}m.play('toggle')});
    else if(cue){cue.setEnabled&&cue.setEnabled(false)}};
  if(btn){btn.addEventListener('click',()=>aplicar(!on));if(lerPref()){btn.setAttribute('aria-pressed','true');btn.querySelector('.som-t').textContent='Som ligado';
      // o navegador só libera áudio depois de um gesto: liga no primeiro clique/tecla
      const arm=()=>{removeEventListener('pointerdown',arm);removeEventListener('keydown',arm);aplicar(true)};addEventListener('pointerdown',arm,{once:true});addEventListener('keydown',arm,{once:true})}}
  // jogo e e-mail do rodapé também soam
  addEventListener('load',()=>{const gm=document.getElementById('game');gm&&gm.addEventListener('pointerdown',()=>window.somTocar('tap',.6));
    addEventListener('keydown',e=>{if((e.code==='Space'||e.key==='ArrowUp')&&document.activeElement===gm)window.somTocar('tap',.6)});
    const fm=document.getElementById('ftMail');fm&&fm.addEventListener('click',()=>window.somTocar('success'))},{once:true});

  /* ---------- pastas: pilha de pastas manila; a aba puxa a pasta para a frente, as outras ficam atrás mostrando só a aba ---------- */
  const pastas=$$('.pasta'),abas=$$('.pasta-aba');
  const abrir=(i,anim=true)=>{const rest=pastas.map((_,k)=>k).filter(k=>k!==i);const ord={};ord[i]=0;rest.forEach((k,n)=>ord[k]=n+1);
    pastas.forEach((p,k)=>{const at=k===i;p.style.setProperty('--o',ord[k]);p.classList.toggle('is-on',at);p.setAttribute('aria-hidden',!at);p.inert=!at});
    abas.forEach((a,k)=>{a.style.setProperty('--o',ord[k]);a.setAttribute('aria-selected',k===i);a.tabIndex=k===i?0:-1});
    if(!G||!anim)return;const p=pastas[i];
    p.animate([{translate:'0 0'},{translate:'0 -26px',offset:.32},{translate:'0 0'}],{duration:720,easing:'cubic-bezier(.34,1.3,.5,1)'});  // a pasta sobe da gaveta e assenta
    G.fromTo(p.querySelector('.pasta-cab'),{y:-12,autoAlpha:0},{y:0,autoAlpha:1,duration:.6,ease:'back.out(1.6)'});
    G.fromTo(p.querySelectorAll('.post'),{scale:1.3,autoAlpha:0,rotation:k=>k%2?14:-14},{scale:1,autoAlpha:1,rotation:(k,el)=>+el.dataset.r,duration:.5,stagger:.09,ease:'back.out(2.4)',delay:.3,
      onStart:()=>setTimeout(()=>window.somTocar&&window.somTocar('tap',.4),300)})};
  abas.forEach((a,i)=>{a.addEventListener('click',()=>abrir(i));
    a.addEventListener('keydown',e=>{const n=abas.length;let k=null;if(e.key==='ArrowRight')k=(i+1)%n;if(e.key==='ArrowLeft')k=(i-1+n)%n;if(e.key==='Home')k=0;if(e.key==='End')k=n-1;
      if(k!==null){e.preventDefault();abrir(k);abas[k].focus()}})});
  $$('.post').forEach(p=>{p.style.setProperty('--r',p.dataset.r+'deg');
    p.addEventListener('pointerenter',()=>{G&&G.to(p,{rotation:0,scale:1.06,duration:.35,ease:'back.out(2)'});window.somTocar&&window.somTocar('select',.3)});
    p.addEventListener('pointerleave',()=>{G&&G.to(p,{rotation:+p.dataset.r,scale:1,duration:.45,ease:'power3'})})});
  if(pastas.length){abrir(0,false);
    if(G&&window.ScrollTrigger)G.from('.pasta-pilha',{y:50,autoAlpha:0,duration:.9,ease:'back.out(1.4)',scrollTrigger:{trigger:'.pastas',start:'top 85%',once:true}})}
})();

/* ---------- CTA: "memorável." iridescente — laranja, azul e amarelo esticam, borram e se juntam (adaptação do "tiny animated SVG", Inspora) ---------- */
(()=>{const el=document.querySelector('.iri'),G=window.gsap;if(!el||!G)return;
  const play=()=>G.fromTo(el,{'--sx':1.9,'--blur':7,'--dx':.14},{'--sx':1,'--blur':0,'--dx':0,duration:1.4,ease:'expo.out'});
  const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect();setTimeout(play,500)}},{threshold:.6});io.observe(el);
  let t=0;el.closest('.cta2').addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();if(e.clientY<r.top-40||e.clientY>r.bottom+40)return;const n=performance.now();if(n-t<900)return;t=n;
    G.fromTo(el,{'--sx':1.35,'--blur':4,'--dx':.07},{'--sx':1,'--blur':0,'--dx':0,duration:1,ease:'expo.out'});window.somTocar&&window.somTocar('select',.3)})})();

/* ================= PROJETOS: modal em tela cheia (referência radilson.com, pedido da Laura 15/11) =================
   O card pintado vira a galeria (view transition com o mesmo campo de aquarela), a ficha desliza da direita.
   ?projeto=<id> no endereço: abre direto, e o voltar do navegador fecha. Esc, × e setas do teclado. */
(()=>{
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const dlg=document.querySelector('.pj-modal'),dados=document.getElementById('pj-dados');if(!dlg||!dados)return;
  const D=JSON.parse(dados.textContent),ids=Object.keys(D),abre=$$('.sc-abre');
  const esq=dlg.querySelector('.pm-esq'),gal=dlg.querySelector('.pm-galeria'),
    tit=dlg.querySelector('#pm-tit'),meta=dlg.querySelector('.pm-meta'),lead=dlg.querySelector('.pm-lead'),ficha=dlg.querySelector('.pm-ficha'),
    link=dlg.querySelector('.pm-link'),navs=$$('.pm-nav',dlg);
  let at=null,origem=null;
  const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.textContent=h;return e};
  const tinta=(par,cls,seed)=>{par.querySelector('canvas')?.remove();const c=el('canvas',cls);c.dataset.seed=seed;c.setAttribute('aria-hidden','true');par.prepend(c);window.pintaJa&&window.pintaJa(c,seed)};
  const rev=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rev.unobserve(e.target)}}),{root:gal,threshold:.08});
  const preenche=k=>{at=k;const p=D[k];
    esq.style.background=p.cor;tinta(esq,'pm-tinta',p.seed);gal.classList.toggle('so1',p.telas.length===1);
    meta.textContent=p.meta;tit.textContent=p.nome;lead.textContent=p.lead;
    ficha.textContent='';p.ficha.forEach(([t,v])=>{const d=el('div'),dd=el('dd');d.append(el('dt','',t));
      (Array.isArray(v)?v:[v]).forEach(x=>dd.append(el('span','',x)));d.append(dd);ficha.append(d)});
    if(p.link){link.href=p.link;link.innerHTML='';link.append(p.linkT+' ');const ar=el('span','','↗');ar.setAttribute('aria-hidden','true');link.append(ar);
      link.hidden=false;if(/^https?:/.test(p.link)){link.target='_blank';link.rel='noopener'}else{link.removeAttribute('target');link.removeAttribute('rel')}}else link.hidden=true;
    gal.textContent='';gal.scrollTop=0;
    p.telas.forEach(([src,w,h,alt])=>{const f=el('figure','janela'),bar=el('div','jn-bar');bar.setAttribute('aria-hidden','true');bar.innerHTML='<i></i><i></i><i></i>';bar.append(el('span','',p.nome));
      const im=new Image(w,h);im.src=src;im.alt=alt;im.decoding='async';f.append(bar,im);gal.append(f);rev.observe(f)});
    const i=ids.indexOf(k),ant=ids[(i-1+ids.length)%ids.length],prox=ids[(i+1)%ids.length];
    navs[0].querySelector('.pm-nav-t').textContent=D[ant].nome;navs[0].dataset.k=ant;navs[0].setAttribute('aria-label','Projeto anterior: '+D[ant].nome);
    navs[1].querySelector('.pm-nav-t').textContent=D[prox].nome;navs[1].dataset.k=prox;navs[1].setAttribute('aria-label','Próximo projeto: '+D[prox].nome)};
  const url=k=>{const u=new URL(location.href);k?u.searchParams.set('projeto',k):u.searchParams.delete('projeto');return u};
  const vt=f=>document.startViewTransition&&!matchMedia('(max-width:900px)').matches?document.startViewTransition(f):(f(),null);
  const abrir=(k,btn,push)=>{if(!D[k])return;origem=btn||abre.find(b=>b.dataset.p===k)||null;const q=origem&&origem.querySelector('.quadro');
    if(q)q.style.viewTransitionName='pm-tinta';
    vt(()=>{if(q)q.style.viewTransitionName='';preenche(k);esq.style.viewTransitionName='pm-tinta';document.documentElement.classList.add('pm-aberto');if(!dlg.open){dlg.showModal();dlg.querySelector('.pm-fechar').focus()}});
    setTimeout(()=>{esq.style.viewTransitionName=''},700);
    if(push)history.pushState({projeto:k},'',url(k))};
  const fechar=(pop)=>{if(!dlg.open||dlg.classList.contains('saindo'))return;dlg.classList.add('saindo');
    setTimeout(()=>{dlg.classList.remove('saindo');dlg.close()},260);if(!pop&&new URL(location.href).searchParams.get('projeto'))history.pushState({},'',url(null))};
  dlg.addEventListener('close',()=>{document.documentElement.classList.remove('pm-aberto');at=null;origem&&origem.focus({preventScroll:true})});
  abre.forEach(b=>b.addEventListener('click',()=>abrir(b.dataset.p,b,true)));
  dlg.addEventListener('cancel',e=>{e.preventDefault();fechar()});
  dlg.querySelector('.pm-fechar').addEventListener('click',()=>fechar());
  navs.forEach(n=>n.addEventListener('click',()=>{const k=n.dataset.k;preenche(k);history.replaceState({projeto:k},'',url(k))}));
  dlg.addEventListener('keydown',e=>{if(e.target.closest('input,textarea'))return;if(e.key==='ArrowRight')navs[1].click();else if(e.key==='ArrowLeft')navs[0].click()});
  addEventListener('popstate',()=>{const k=new URL(location.href).searchParams.get('projeto');if(k&&D[k]){if(dlg.open)preenche(k);else abrir(k,null,false)}else fechar(true)});
  const k0=new URL(location.href).searchParams.get('projeto');if(k0&&D[k0])setTimeout(()=>abrir(k0,null,false),300);
})();

/* ================= NAV (pedido da Laura, 15/11): pílula que se recolhe e a joaninha como indicador =================
   A v8 alterna .compact no scroll; aqui a largura vira animação (de 100% para o tamanho do conteúdo e de volta).
   A joaninha anda até o link ativo, olha para o link sob o cursor e voa quando o destino está a mais de 180 px.
   Sem links visíveis (celular), ela caminha conforme a leitura da página. Só redesenha quando há movimento. */
(()=>{
  const nv=document.getElementById('nv'),inn=nv&&nv.querySelector('.nv-in'),cv=nv&&nv.querySelector('.nv-bug');
  if(!inn)return;
  // ---- largura: FLIP simples entre a barra e a pílula
  let compact=nv.classList.contains('compact'),wT=0;
  const morph=()=>{const c=nv.classList.contains('compact');if(c===compact)return;compact=c;
    const w1=inn.getBoundingClientRect().width;nv.classList.toggle('compact',!c);inn.style.width='';inn.style.transition='none';
    const w0=inn.getBoundingClientRect().width;nv.classList.toggle('compact',c);
    inn.style.width=w0+'px';void inn.offsetWidth;inn.style.transition='';
    inn.style.transition=getComputedStyle(inn).transition+',width .6s cubic-bezier(.23,1,.32,1)';inn.style.width=w1+'px';
    clearTimeout(wT);wT=setTimeout(()=>{inn.style.width='';inn.style.transition=''},650)};
  new MutationObserver(morph).observe(nv,{attributes:true,attributeFilter:['class']});
  if(!cv||typeof makeBug!=='function'||typeof drawBug!=='function')return;
  // ---- a joaninha
  const ctx=cv.getContext('2d'),links=[...nv.querySelectorAll('.nv-links a')],DPR=Math.min(2,devicePixelRatio||1);
  let W=0,H=0;const fit=()=>{const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR)};
  new ResizeObserver(fit).observe(cv);fit();
  const P=makeBug({turn:1});let bx=null,hov=null,lastD=0,still=0,flying=false;
  const S=()=>compact?40:36;
  const alvo=()=>{const cr=cv.getBoundingClientRect(),visivel=links.length&&links[0].offsetParent;
    if(visivel){const a=hov||links.find(l=>l.classList.contains('on'));if(a){const r=a.getBoundingClientRect();return r.left+r.width/2-cr.left}}
    // celular ou topo sem seção ativa: a leitura da página
    const h=document.documentElement,pr=Math.min(1,Math.max(0,scrollY/(h.scrollHeight-innerHeight||1)));
    if(visivel&&scrollY<innerHeight*.5){const r=links[0].getBoundingClientRect();return r.left-cr.left-28}
    return 18+pr*(W-36)};
  links.forEach(a=>{a.addEventListener('pointerenter',()=>{hov=a});a.addEventListener('pointerleave',()=>{hov=null});
    a.addEventListener('focus',()=>{hov=a});a.addEventListener('blur',()=>{hov=null})});
  const som=nv.querySelector('.som');
  som&&som.addEventListener('click',()=>{if(som.getAttribute('aria-pressed')==='true'){P.tg.happy=1;typeof bugJump==='function'&&bugJump(P,1.1);setTimeout(()=>{P.tg.happy=0},1400)}});
  (window.FXD=window.FXD||[]).push((now,dt)=>{
    if(!W)return;const tx=alvo();if(bx===null)bx=tx;const dx=tx-bx,ad=Math.abs(dx);
    const moving=ad>1.2||P.airY>0.2||P.jq||Math.abs(P.walking)>.05||Math.abs(P.fly-P.tg.fly)>.02;
    if(!moving){still+=dt;if(now-lastD<120)return}else still=0; // parada, respira a ~8 qps
    if(ad>120&&!flying){flying=true;P.tg.fly=1;P.flyH=compact?18:12}
    if(flying&&ad<8){flying=false;P.tg.fly=0}
    if(ad>1.2){P.tg.turn=dx>0?1:-1;const v=Math.min(ad*(flying?.16:.12),flying?16:5)*dt;bx+=Math.sign(dx)*Math.min(v,ad);
      if(!flying){P.tg.walking=1;P.walk+=Math.max(0,v/(.0245*S())-.3*dt)}}
    else{P.tg.walking=0;P.tg.turn=hov?(P.tg.turn):.45}
    look(P,hov?hov.getBoundingClientRect():{left:-9e3,top:0,width:0,height:0},now);
    stepBug(P,dt,now);lastD=now;
    const s=S(),ground=compact?47:H-1;
    ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);if(!compact)return;
    drawBug(ctx,P,bx-s/2,ground-s*.86,s,{bg:'papel'})});
})();

/* ================= outros projetos: slideshow (15/11) ================= */
(()=>{
  const tr=document.getElementById('pk-show');if(!tr)return;const setas=[...document.querySelectorAll('.pk-seta')];
  const passo=()=>{const c=tr.querySelector('.sc');return c?c.getBoundingClientRect().width+parseFloat(getComputedStyle(tr).columnGap||32):tr.clientWidth*.8};
  const estado=()=>{const m=tr.scrollWidth-tr.clientWidth-4;setas[0].disabled=tr.scrollLeft<=4;setas[1].disabled=tr.scrollLeft>=m};
  setas.forEach(b=>b.addEventListener('click',()=>{tr.scrollBy({left:passo()*+b.dataset.d,behavior:'smooth'});window.somTocar&&window.somTocar('select',.3)}));
  const recuo=()=>{tr.style.scrollPaddingLeft=getComputedStyle(tr).paddingLeft};recuo();tr.scrollLeft=0;  // o snap alinha o card ao título, não à borda
  tr.addEventListener('scroll',()=>requestAnimationFrame(estado),{passive:true});addEventListener('resize',()=>{recuo();estado()});estado();
  tr.addEventListener('keydown',e=>{if(e.target!==tr)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();tr.scrollBy({left:passo()*(e.key==='ArrowRight'?1:-1),behavior:'smooth'})}});
  // arraste com o mouse; um arraste não vira clique no card
  let x0=0,s0=0,mov=false,ativo=false;
  tr.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button)return;ativo=true;mov=false;x0=e.clientX;s0=tr.scrollLeft});
  addEventListener('pointermove',e=>{if(!ativo)return;const dx=e.clientX-x0;if(!mov&&Math.abs(dx)>6){mov=true;tr.classList.add('arrasta')}if(mov)tr.scrollLeft=s0-dx});
  addEventListener('pointerup',()=>{if(!ativo)return;ativo=false;if(!mov)return;tr.classList.remove('arrasta');
    const p=passo(),alvo=Math.round(tr.scrollLeft/p)*p;tr.scrollTo({left:alvo,behavior:'smooth'})});
})();
