/* HERO 3 · variantes com flores pintadas (15/11). Ativa só com ?hero=a|b|c; sem o parâmetro a hero atual segue igual.
   A · prancha botânica (papel, moldura fina, flores presas com fita, polaroide colada)
   B · diagonal macro (uma papoula gigante cortada pela borda, caules em diagonal, título grande embaixo)
   C · retrato no jardim (a foto grande no centro, flores atrás e na frente dela, título dividido) */
(()=>{
  const V=window.HERO_V,hero=document.querySelector('.hz');
  if(!hero||!/^[ac]$/.test(V||''))return; // B (padrão, em pixel) vive em hero-px.js
  const B='/img/flora/',G=window.gsap,ST=window.ScrollTrigger,FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
  hero.classList.add('h3','v-'+V);
  hero.querySelectorAll('.hz-back,.hz-front').forEach(e=>e.remove());
  const pe=hero.querySelector('.hz-pe'),tit=hero.querySelector('.hz-tit'),foto=hero.querySelector('.hz-foto'),bugC=hero.querySelector('.hz-bug');
  pe&&pe.querySelector('.btn')&&pe.querySelector('.btn').remove();
  const fl=(src,cls,front)=>{const d=document.createElement('div');d.className='fl '+cls+(front?' fr':'');d.setAttribute('aria-hidden','true');
    const i=new Image();i.src=B+src;i.alt='';i.draggable=false;i.decoding='async';d.append(i);return d};
  const add=(el,before)=>hero.insertBefore(el,before||bugC);
  const ancora=(f,x,y)=>{const a=document.createElement('i');a.className='ancora';a.style.left=x+'%';a.style.top=y+'%';f.append(a);return a};
  const deco=c=>{const d=document.createElement('i');d.className=c;d.setAttribute('aria-hidden','true');return d};
  let flores=[];
  if(V==='a'){
    add(deco('moldura-p'),tit);
    flores=[fl('papoula.webp','fl-pap'),fl('margarida.webp','fl-mar',1),fl('centaurea.webp','fl-cen')];
    flores.forEach(f=>add(f,foto));
    ['f1','f2','f3','f4'].forEach(c=>add(deco('fita '+c)));
  }else if(V==='b'){
    flores=[fl('papoula.webp','fl-cab'),fl('margarida.webp','fl-mar'),fl('centaurea.webp','fl-cen',1)];
    flores.slice(0,2).forEach(f=>add(f,tit));add(flores[2]);
  }else{
    tit.innerHTML='<span class="t1">Building</span> <span class="t2">the <br>beyond.</span>';
    flores=[fl('margarida.webp','fl-mar'),fl('centaurea.webp','fl-cen'),fl('papoula.webp','fl-pap',1)];
    add(flores[0],foto);add(flores[1],foto);add(flores[2]);
  }

  /* entrada: as plantas crescem do pé (clip), o título sobe por letra, a foto cai e assenta */
  const go=()=>{
    if(!G)return;
    const tl=G.timeline({delay:.1});
    let sp=null;if(window.SplitText&&V!=='c')sp=SplitText.create(tit,{type:'chars,words',mask:'chars'});
    if(sp)tl.from(sp.chars,{yPercent:115,duration:1.15,stagger:.03,ease:'expo.out',onComplete:()=>sp.revert()},0);
    else tl.from(tit.children.length?tit.children:tit,{yPercent:40,autoAlpha:0,duration:1.1,stagger:.12,ease:'expo.out'},0);
    tl.fromTo(flores,{clipPath:'inset(100% -20% 0 -20%)'},{clipPath:'inset(-20% -20% -20% -20%)',duration:1.6,stagger:.12,ease:'power3.out',clearProps:'clipPath'},.25)
      .from(foto,{y:-220,autoAlpha:0,duration:1.3,ease:'elastic.out(1,.6)'},.55)
      .from(hero.querySelectorAll('.fita,.moldura-p'),{autoAlpha:0,duration:.6,stagger:.06},1.2)
      .from(pe?pe.children:[],{y:18,autoAlpha:0,duration:.9,ease:'expo.out'},.9);
    if(FINE){const q=(el,p)=>({x:G.quickTo(el,'x',{duration:1,ease:'power3'}),y:G.quickTo(el,'y',{duration:1,ease:'power3'}),p});
      const L=[...flores.map((f,i)=>q(f,f.classList.contains('fr')?22:-8-i*3)),q(tit,5),q(foto,12)];
      hero.addEventListener('pointermove',e=>{const nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;L.forEach(l=>{l.x(nx*l.p);l.y(ny*l.p*.5)})})}
    if(ST)G.timeline({scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}})
      .to(tit,{yPercent:-22,ease:'none'},0).to(flores.filter(f=>f.classList.contains('fr')),{yPercent:-12,ease:'none'},0)
      .to(flores.filter(f=>!f.classList.contains('fr')),{yPercent:-4,ease:'none'},0).to(foto,{yPercent:-30,ease:'none'},0);
  };

  /* a joaninha voa em curva e pousa: A na margarida, B e C na borda de cima da foto */
  function bug(){
    if(!bugC||typeof makeBug!=='function')return;
    const fit=()=>{const d=Math.min(devicePixelRatio||1,2),w=bugC.clientWidth,h=bugC.clientHeight;bugC.width=Math.round(w*d);bugC.height=Math.round(h*d);const x=bugC.getContext('2d');x.setTransform(d,0,0,d,0,0);return {x,w,h}};
    let F=fit();addEventListener('resize',()=>{F=fit()});
    const A=V==='a'?ancora(hero.querySelector('.fl-mar'),50,3):null;
    const alvo=()=>{const hr=hero.getBoundingClientRect();if(A){const r=A.getBoundingClientRect();return {x:r.left-hr.left,y:r.top-hr.top}}
      const r=foto.getBoundingClientRect();return {x:r.left-hr.left+r.width*.72,y:r.top-hr.top}};
    const P=makeBug({turn:-.4,fly:1,hold:true}),mob=()=>innerWidth<860,S=()=>mob()?58:92;let tb=performance.now(),landed=false,last=0,vis=true;
    new IntersectionObserver(es=>{vis=es[0].isIntersecting},{rootMargin:'100px'}).observe(hero);
    hero.addEventListener('click',e=>{if(e.target.closest('a,button'))return;if(landed&&typeof bugJump==='function'){bugJump(P,.9);window.somTocar&&window.somTocar('tap')}});
    const ease=t=>1-Math.pow(1-t,3);
    window.FXD=window.FXD||[];window.FXD.push((_n,dt)=>{if(!vis)return;const now=performance.now();if(landed&&now-last<66)return;dt=landed&&last?Math.min(4,(now-last)/16.67):dt;last=now;
      F.x.clearRect(0,0,F.w,F.h);const T=alvo(),k=Math.min(1,(now-tb)/2200),e=ease(k),sx=F.w+80,sy=-80,cx=F.w*.7,cy=F.h*.08,u=1-e;
      const x=u*u*sx+2*u*e*cx+e*e*T.x,y=u*u*sy+2*u*e*cy+e*e*T.y;
      if(k>=1&&!landed){landed=true;window.somTocar&&window.somTocar('toggle',.5)}
      P.tg.fly=landed?0:1;P.fly=landed?0:1;P.tg.walking=0;P.tg.turn=landed?-.35:-.6;typeof look==='function'&&look(P,bugC.getBoundingClientRect(),now);stepBug(P,dt,now);drawBug(F.x,P,x-S()/2,y-S()*.86,S(),{bg:'papel'})});
  }
  const imgs=flores.map(f=>f.querySelector('img'));
  Promise.all([document.fonts?document.fonts.ready:0,...imgs.map(i=>i.decode?i.decode().catch(()=>0):0)]).then(()=>{go();setTimeout(bug,1500)});
})();
