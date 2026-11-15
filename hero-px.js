/* HERO B em pixel (15/11, escolha da Laura: "B, porém não quero a minha imagem na hero, e quero que melhore as flores para serem
   pixelizadas como lady"). As pranchas pintadas (Flora Batava, Masclef; domínio público) continuam como fonte. Elas são desenhadas
   a cada quadro numa grade de baixa resolução alinhada à tela, com células do tamanho das da joaninha. Cada célula recebe a cor mais
   próxima da paleta da marca (verde-sálvia só na vegetação), sem anti-alias, e o canvas é ampliado com image-rendering:pixelated.
   O vento, a entrada crescendo do pé e a paralaxe acontecem antes da quantização, então tudo continua na grade. */
(()=>{
  const V=window.HERO_V,hero=document.querySelector('.hz');
  if(!hero||V!=='b')return;
  const B='/img/flora/',G=window.gsap,ST=window.ScrollTrigger,FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
  hero.classList.add('h3','v-b','px');
  hero.querySelectorAll('.hz-back,.hz-front').forEach(e=>e.remove());
  const pe=hero.querySelector('.hz-pe'),tit=hero.querySelector('.hz-tit'),foto=hero.querySelector('.hz-foto'),bugC=hero.querySelector('.hz-bug');
  pe&&pe.querySelector('.btn')&&pe.querySelector('.btn').remove();
  foto&&foto.remove(); // sem a foto dela na hero (pedido de 15/11)

  /* paleta da marca (tokens.css) + verde-sálvia da vegetação; o creme-100 do fundo fica de fora para nenhuma célula sumir no papel */
  // paleta curta (~18 cores), como a joaninha: faixas chapadas em vez de foto pixelizada
  const HEX=['FF8C80','FF644C','F24100','D03700','A32900','731A00',      // papoula: laranja da marca
    'CBD8FF','829EFF','4056F3','1E239F','110D72',                        // centáurea: azul da marca
    'FFA200','E69200',                                                   // miolo: amarelo
    'FEF6E2','D1C8B2','35332C','1D1A15',                                 // pétala branca, sombra, miolo escuro
    '2F4A2A','3E5A35','56744A','86A06E','B9D38B'];                       // vegetação: verde-sálvia
  const PAL=HEX.map(h=>[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]);
  const cache=new Map();
  const near=(r,g,b)=>{const k=(r>>3)<<10|(g>>3)<<5|(b>>3);let c=cache.get(k);if(c)return c;let best=0,bd=1e9;
    for(let i=0;i<PAL.length;i++){const p=PAL[i],rm=(r+p[0])/2,dr=r-p[0],dg=g-p[1],db=b-p[2];
      const d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;best=i}}
    c=PAL[best];cache.set(k,c);return c};

  /* geometria das plantas: os .fl continuam no DOM (posição, tamanho, giro e origem vêm do CSS), invisíveis; o canvas lê deles */
  const fl=(src,cls,front)=>{const d=document.createElement('div');d.className='fl '+cls+(front?' fr':'');d.setAttribute('aria-hidden','true');
    const i=new Image();i.src=B+src;i.alt='';i.decoding='async';d.append(i);return d};
  const flores=[fl('papoula.webp','fl-cab'),fl('margarida.webp','fl-mar'),fl('centaurea.webp','fl-cen',1)];
  flores.slice(0,2).forEach(f=>hero.insertBefore(f,tit));hero.insertBefore(flores[2],bugC);
  const mk=c=>{const cv=document.createElement('canvas');cv.className='px-camada '+c;cv.setAttribute('aria-hidden','true');return cv};
  const cvB=mk('px-tras'),cvF=mk('px-frente');hero.insertBefore(cvB,tit);hero.insertBefore(cvF,bugC);
  const cxB=cvB.getContext('2d',{willReadFrequently:true}),cxF=cvF.getContext('2d',{willReadFrequently:true});

  let CELL=5,lw=0,lh=0,P=[],t0=0,vis=true,top=null,mat=new Uint8Array(1);
  const deg=s=>parseFloat(s)*Math.PI/180||0;
  function layout(){
    CELL=4;const W=hero.clientWidth,H=hero.clientHeight;lw=Math.ceil(W/CELL);lh=Math.ceil(H/CELL);
    mat=new Uint8Array(lw*lh);for(const cv of [cvB,cvF]){cv.width=lw;cv.height=lh;cv.style.width=lw*CELL+'px';cv.style.height=lh*CELL+'px'}
    P=flores.map((f,i)=>{const img=f.querySelector('img'),cs=getComputedStyle(f),o=cs.transformOrigin.split(' ').map(parseFloat);
      const w=f.offsetWidth,h=f.offsetHeight,x=f.offsetLeft,y=f.offsetTop;
      // pré-reduz a prancha para ~1,5× a resolução da grade (desenho por quadro barato)
      const sw=Math.max(8,Math.round(w/CELL*1.5)),sh=Math.max(8,Math.round(h/CELL*1.5)),pre=document.createElement('canvas');pre.width=sw;pre.height=sh;
      const pc=pre.getContext('2d');pc.imageSmoothingQuality='high';pc.drawImage(img,0,0,sw,sh);
      return {front:f.classList.contains('fr'),pre,x,y,w,h,ox:o[0],oy:o[1],rot:deg(cs.rotate),ph:i*1.9,per:6200+i*1300,delay:250+i*120}});
  }
  const ease=t=>1-Math.pow(1-t,3);
  function draw(ctx,front,now){
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,lw,lh);ctx.imageSmoothingEnabled=true;
    const k=1/CELL;
    for(const p of P){if(p.front!==front)continue;const g=t0?Math.min(1,Math.max(0,(now-t0-p.delay)/1600)):0;if(g<=0)continue;const e=ease(g);
      const sway=Math.sin(now/p.per*6.283+p.ph)*.019;
      ctx.save();ctx.setTransform(k,0,0,k,0,0);ctx.translate(p.x+p.ox,p.y+p.oy);ctx.rotate(p.rot);
      // vento: balanço em volta do pé da planta
      const bx=p.w/2-p.ox,by=p.h-p.oy;ctx.translate(bx,by);ctx.rotate(sway);ctx.translate(-bx,-by);
      ctx.beginPath();ctx.rect(-p.ox-4,-p.oy+p.h*(1-e),p.w+8,p.h*e+4);ctx.clip();
      ctx.drawImage(p.pre,-p.ox,-p.oy,p.w,p.h);ctx.restore()}
    ctx.setTransform(1,0,0,1,0,0);
    const im=ctx.getImageData(0,0,lw,lh),d=im.data;
    // r9b · sprite, não amostragem (banca: "lê como foto posterizada"). Cada célula vira material + tom (até 3 tons por material);
    // um filtro de moda 3×3 tira pixels soltos; a borda com o vazio vira contorno de 1 célula em azul-900, como a joaninha.
    const N=lw*lh,code=new Uint8Array(N); // 0 vazio; material*4+tom (tom 1..3)
    const lum=new Float32Array(N);
    for(let j=0,i=0;j<N;j++,i+=4){if(d[i+3]<120){code[j]=0;continue}const r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(r*.3+g*.59+b*.11);lum[j]=l;
      let m;if(l<48)m=b>r+14&&b>g+8?2:5;else if(mx-mn<34&&l>192)m=4;else if(r>g+40&&r>b+20)m=1;else if(b>r+22&&b>g+8&&(mx-mn>34||b>200))m=2;else if(r>150&&g>110&&b<90&&r-b>90)m=6;else m=3;
      const t=m===5||m===6?2:(l>(m===4?225:m===1?150:m===2?150:150)?1:l>(m===1?92:m===2?85:78)?2:3);code[j]=m*4+t}
    const out=new Uint8Array(N),cnt=new Uint8Array(32);
    for(let pass=0;pass<3;pass++){const src=pass?out.slice():code;
      for(let y=0;y<lh;y++)for(let x=0;x<lw;x++){const j=y*lw+x;if(!src[j]){out[j]=0;continue}cnt.fill(0);let best=src[j],bc=0;
        for(let dy=-1;dy<=1;dy++){const yy=y+dy;if(yy<0||yy>=lh)continue;for(let dx=-1;dx<=1;dx++){const xx=x+dx;if(xx<0||xx>=lw)continue;const c=src[yy*lw+xx];if(c&&++cnt[c]>bc){bc=cnt[c];best=c}}}
        out[j]=bc>=3?best:src[j]}}
    // ilhas: célula escura (5) ou branca (4) cercada por outra massa vira o tom fundo dessa massa (sem pintas pretas nas folhas e no miolo)
    for(let y=1;y<lh-1;y++)for(let x=1;x<lw-1;x++){const j=y*lw+x,m=out[j]>>2;if(m!==5&&m!==4)continue;const tally={};let bm=0,bc=0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const n=out[j+dy*lw+dx]>>2;if(n&&n!==m){tally[n]=(tally[n]||0)+1;if(tally[n]>bc){bc=tally[n];bm=n}}}
      if(bc>=5)out[j]=bm*4+3}
    // azul isolado (haste azulada, < 3 vizinhos azuis) vira verde escuro: o contorno azul só fecha flor de verdade
    for(let y=1;y<lh-1;y++)for(let x=1;x<lw-1;x++){const j=y*lw+x;if((out[j]>>2)!==2)continue;let n=0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&(out[j+dy*lw+dx]>>2)===2)n++;if(n<3)out[j]=3*4+3}
    // haste com 1 célula de largura some (vira vazio) — caule fica com no mínimo 2 células
    for(let y=1;y<lh-1;y++)for(let x=1;x<lw-1;x++){const j=y*lw+x;if((out[j]>>2)!==3)continue;
      const h=!out[j-1]&&!out[j+1],v=!out[j-lw]&&!out[j+lw];if(h||v)out[j]=0}
    // papoula em faixas: tom pela luminância média 5×5 (só células vermelhas), não pela célula isolada
    for(let y=2;y<lh-2;y++)for(let x=2;x<lw-2;x++){const j=y*lw+x;if((out[j]>>2)!==1)continue;let sm=0,n=0;
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const k=j+dy*lw+dx;if((out[k]>>2)===1){sm+=lum[k];n++}}const m=sm/n;out[j]=4+(m>132?1:m>96?2:3)}
    // componentes de até 4 células (6 para o preto) viram o material vizinho dominante; sem vizinho, somem
    {const seen=new Uint8Array(N),stack=[],comp=[];
      for(let s0=0;s0<N;s0++){if(seen[s0]||!out[s0])continue;const m0=out[s0]>>2;comp.length=0;stack.length=0;stack.push(s0);seen[s0]=1;
        while(stack.length){const j=stack.pop();comp.push(j);const x=j%lw;
          for(const k of [x>0?j-1:-1,x<lw-1?j+1:-1,j-lw,j+lw]){if(k<0||k>=N||seen[k]||!out[k]||(out[k]>>2)!==m0)continue;seen[k]=1;stack.push(k)}}
        const lim=m0===5?6:4;if(comp.length>lim)continue;
        const tally={};let bm=0,bc=0;for(const j of comp){const x=j%lw;for(const k of [x>0?j-1:-1,x<lw-1?j+1:-1,j-lw,j+lw]){if(k<0||k>=N)continue;const n=out[k]>>2;if(n&&n!==m0){tally[n]=(tally[n]||0)+1;if(tally[n]>bc){bc=tally[n];bm=n}}}}
        for(const j of comp)out[j]=bm?bm*4+(bm===3?3:2):0}}
    const RAMP={1:['FF644C','F24100','D03700'],2:['829EFF','4056F3','1E239F'],3:['A5BB86','6E8B5B','3E5A35'],4:['FEF6E2','E8DDC2','D1C8B2'],5:['1D1A15','1D1A15','1D1A15'],6:['FFA200','FFA200','E69200']};
    const rgb=h=>[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)],RC={};for(const k in RAMP)RC[k]=RAMP[k].map(rgb);
    const OL=[17,13,114]; // azul-900
    for(let y=0;y<lh;y++)for(let x=0;x<lw;x++){const j=y*lw+x,i=j*4,c=out[j];if(!c){d[i+3]=0;continue}
      const edge=(x>0&&!out[j-1])||(x<lw-1&&!out[j+1])||(y>0&&!out[j-lw])||(y<lh-1&&!out[j+lw]);
      // contorno azul só nas flores; folha e caule fecham no verde mais escuro
      const mm=c>>2,col=edge?(mm===3?RC[3][2]:OL):RC[mm][(c&3)-1];d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255;mat[j]=c>>2}
    ctx.putImageData(im,0,0);return d}
  // pouso da joaninha: a célula laranja mais alta da papoula grande (metade direita, abaixo da nav)
  // pouso: a pétala branca mais alta (margarida) — o vermelho da joaninha aparece; fallback: a folha mais alta da metade direita
  function acharTopo(){let best=null;for(let y=Math.round(lh*.12);y<lh&&!best;y++)for(let x=Math.round(lw*.3);x<lw-2;x++){if(mat[y*lw+x]===4){let n=0;for(let dy=0;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const yy=y+dy,xx=x+dx;if(yy<lh&&xx>=0&&xx<lw&&mat[yy*lw+xx]===4)n++}if(n>=(innerWidth<860?6:9)){best={x:x*CELL,y:y*CELL+(innerWidth<860?CELL:0)};break}}}
    if(best)return best;for(let y=Math.round(lh*.12);y<lh;y++)for(let x=Math.round(lw*.5);x<lw-2;x++)if(mat[y*lw+x]===3)return {x:x*CELL,y:y*CELL};return null}
  let last=0;
  function frame(now){requestAnimationFrame(frame);if(!vis||!lw)return;const ent=t0&&now-t0<2400,gap=ent?40:(innerWidth<860?250:160);if(now-last<gap)return;last=now; // 25 qps na entrada; depois o vento anda em passos (6 qps, 4 no celular)
    mat.fill(0);draw(cxB,false,now);draw(cxF,true,now);
    if(!top||now-(top.t||0)>200){const t=acharTopo();if(t){t.t=now;top=top?{x:top.x+(t.x-top.x)*.5,y:top.y+(t.y-top.y)*.5,t:now}:t}}}

  /* joaninha: voa em curva e pousa na papoula grande */
  function bug(){
    if(!bugC||typeof makeBug!=='function')return;
    const fit=()=>{const dp=Math.min(devicePixelRatio||1,2),w=bugC.clientWidth,h=bugC.clientHeight;bugC.width=Math.round(w*dp);bugC.height=Math.round(h*dp);const x=bugC.getContext('2d');x.setTransform(dp,0,0,dp,0,0);return {x,w,h}};
    let F=fit();addEventListener('resize',()=>{F=fit()});
    const Pb=makeBug({turn:-.4,fly:1,hold:true}),S=()=>innerWidth<860?58:92;let tb=performance.now(),landed=false,lst=0;
    hero.addEventListener('click',e=>{if(e.target.closest('a,button'))return;if(landed&&typeof bugJump==='function'){bugJump(Pb,.9);window.somTocar&&window.somTocar('tap')}});
    window.FXD=window.FXD||[];window.FXD.push((_n,dt)=>{if(!vis)return;const now=performance.now();if(landed&&now-lst<66)return;dt=landed&&lst?Math.min(4,(now-lst)/16.67):dt;lst=now;
      F.x.clearRect(0,0,F.w,F.h);const T=top||{x:F.w*.72,y:F.h*.3},k=Math.min(1,(now-tb)/2200),e=ease(k),sx=F.w+80,sy=-80,cx=F.w*.7,cy=F.h*.08,u=1-e;
      const x=u*u*sx+2*u*e*cx+e*e*T.x,y=u*u*sy+2*u*e*cy+e*e*T.y;
      if(k>=1&&!landed){landed=true;window.somTocar&&window.somTocar('toggle',.5)}
      Pb.tg.fly=landed?0:1;Pb.fly=landed?0:1;Pb.tg.walking=0;Pb.tg.turn=landed?-.35:-.6;typeof look==='function'&&look(Pb,bugC.getBoundingClientRect(),now);stepBug(Pb,dt,now);drawBug(F.x,Pb,x-S()/2,y-S()*.86,S(),{bg:'papel'})});
  }

  new IntersectionObserver(es=>{vis=es[0].isIntersecting},{rootMargin:'100px'}).observe(hero);
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{layout();top=null},200)});
  const imgs=flores.map(f=>f.querySelector('img'));
  Promise.all([document.fonts?document.fonts.ready:0,...imgs.map(i=>i.decode?i.decode().catch(()=>0):0)]).then(()=>{
    layout();t0=performance.now();requestAnimationFrame(frame);setTimeout(bug,1500);
    if(!G)return;
    const tl=G.timeline({delay:.1});let sp=null;if(window.SplitText)sp=SplitText.create(tit,{type:'chars,words',mask:'chars'});
    if(sp)tl.from(sp.chars,{yPercent:115,duration:1.15,stagger:.03,ease:'expo.out',onComplete:()=>sp.revert()},0);
    tl.from(pe?pe.children:[],{y:18,autoAlpha:0,duration:.9,ease:'expo.out'},.9);
    if(FINE){const q=(el,p)=>({x:G.quickTo(el,'x',{duration:1,ease:'power3'}),y:G.quickTo(el,'y',{duration:1,ease:'power3'}),p});
      const L=[q(cvB,-10),q(cvF,20),q(tit,5)];
      hero.addEventListener('pointermove',e=>{const nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;L.forEach(l=>{l.x(Math.round(nx*l.p/CELL)*CELL);l.y(Math.round(ny*l.p*.5/CELL)*CELL)})})}
    if(ST)G.timeline({scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}})
      .to(tit,{yPercent:-22,ease:'none'},0).to(cvF,{yPercent:-12,ease:'none'},0).to(cvB,{yPercent:-4,ease:'none'},0);
  });
})();
