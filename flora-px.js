/* Flores em pixel no jardim do Sobre e no jogo do rodapé (15/11, "aprovado, aplica as flores no jardim e no jogo").
   Mesmo método da hero aprovada (hero-px.js): as pranchas botânicas (Flora Batava, Masclef; domínio público) viram sprites numa grade
   de células, com material + até 3 tons, moda 3×3, ilhas absorvidas e contorno azul-900 só nas flores.
   Substitui as funções globais do v8 flowerCanvas / drawFlower / swayDraw, então jardim, fileira de fundo, obstáculos e flores do jogo
   usam os sprites. O vento vira deslocamento de linhas de células (cisalhamento), sem girar pixel. */
(()=>{
  if(typeof flowerCanvas!=='function'||typeof swayDraw!=='function')return;
  const B='/img/flora/',FILES={papoula:'papoula-uma.webp',centaurea:'centaurea.webp',margarida:'margarida.webp'};
  const IMG={};let ready=false;
  const kind=sp=>sp.type==='papoula'||sp.type==='centaurea'||sp.type==='margarida'?sp.type:(['papoula','centaurea','margarida'][sp.seed%3]);
  function pixelize(d,lw,lh,small){
    const N=lw*lh,code=new Uint8Array(N); // 0 vazio; material*4+tom (tom 1..3)
    const lum=new Float32Array(N);
    for(let j=0,i=0;j<N;j++,i+=4){if(d[i+3]<(small?60:120)){code[j]=0;continue}const r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(r*.3+g*.59+b*.11);lum[j]=l;
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
    if(!small)for(let y=1;y<lh-1;y++)for(let x=1;x<lw-1;x++){const j=y*lw+x;if((out[j]>>2)!==3)continue;
      const h=!out[j-1]&&!out[j+1],v=!out[j-lw]&&!out[j+lw];if(h||v)out[j]=0}
    // papoula em faixas: tom pela luminância média 5×5 (só células vermelhas), não pela célula isolada
    for(let y=2;y<lh-2;y++)for(let x=2;x<lw-2;x++){const j=y*lw+x;if((out[j]>>2)!==1)continue;let sm=0,n=0;
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const k=j+dy*lw+dx;if((out[k]>>2)===1){sm+=lum[k];n++}}const m=sm/n;out[j]=4+(m>132?1:m>96?2:3)}
    // componentes de até 4 células (6 para o preto) viram o material vizinho dominante; sem vizinho, somem
    {const seen=new Uint8Array(N),stack=[],comp=[];
      for(let s0=0;s0<N;s0++){if(seen[s0]||!out[s0])continue;const m0=out[s0]>>2;comp.length=0;stack.length=0;stack.push(s0);seen[s0]=1;
        while(stack.length){const j=stack.pop();comp.push(j);const x=j%lw;
          for(const k of [x>0?j-1:-1,x<lw-1?j+1:-1,j-lw,j+lw]){if(k<0||k>=N||seen[k]||!out[k]||(out[k]>>2)!==m0)continue;seen[k]=1;stack.push(k)}}
        const lim=small?1:(m0===5?6:4);if(comp.length>lim)continue;
        const tally={};let bm=0,bc=0;for(const j of comp){const x=j%lw;for(const k of [x>0?j-1:-1,x<lw-1?j+1:-1,j-lw,j+lw]){if(k<0||k>=N)continue;const n=out[k]>>2;if(n&&n!==m0){tally[n]=(tally[n]||0)+1;if(tally[n]>bc){bc=tally[n];bm=n}}}}
        for(const j of comp)out[j]=bm?bm*4+(bm===3?3:2):0}}
    const RAMP={1:['FF644C','F24100','D03700'],2:['829EFF','4056F3','1E239F'],3:['A5BB86','6E8B5B','3E5A35'],4:['FEF6E2','E8DDC2','D1C8B2'],5:['1D1A15','1D1A15','1D1A15'],6:['FFA200','FFA200','E69200']};
    const rgb=h=>[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)],RC={};for(const k in RAMP)RC[k]=RAMP[k].map(rgb);
    const OL=[17,13,114]; // azul-900
    for(let y=0;y<lh;y++)for(let x=0;x<lw;x++){const j=y*lw+x,i=j*4,c=out[j];if(!c){d[i+3]=0;continue}
      const edge=(x>0&&!out[j-1])||(x<lw-1&&!out[j+1])||(y>0&&!out[j-lw])||(y<lh-1&&!out[j+lw]);
      // contorno azul só nas flores; folha e caule fecham no verde mais escuro
      const mm=c>>2,col=edge?(mm===3?RC[3][2]:OL):RC[mm][(c&3)-1];d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255}
  }
  const cache=new Map();
  function sprite(sp,U,cell){const k=kind(sp),img=IMG[k],jogo=(cell||4)<5;
    // jardim: flores ~45% maiores, célula 6 (≈5 px na tela); jogo: célula 4 e recorte com caule curto (cabeça maior na mesma altura)
    if(!jogo)U*=1.45;cell=Math.max(3,Math.round(cell||4));const sh=jogo?.62:1;
    const H=Math.max(cell*8,Math.round(((sp.h||4)+(sp.R||1.3)*.75)*U/(cell*4))*cell*4) /* alturas em degraus de 4 células: reaproveita sprite */,W=Math.max(cell*4,Math.round(H*img.naturalWidth/(img.naturalHeight*sh)/cell)*cell);
    const key=k+'|'+H+'|'+cell+'|'+(jogo?1:0);let c=cache.get(key);if(c)return c;
    const lw=W/cell,lh=H/cell,lo=document.createElement('canvas');lo.width=lw;lo.height=lh;const lx=lo.getContext('2d',{willReadFrequently:true});lx.imageSmoothingQuality='high';
    lx.drawImage(img,0,0,img.naturalWidth,img.naturalHeight*sh,0,0,lw,lh);const im=lx.getImageData(0,0,lw,lh);pixelize(im.data,lw,lh,lh<40);lx.putImageData(im,0,0);
    c=document.createElement('canvas');c.width=W;c.height=H;const cx=c.getContext('2d');cx.imageSmoothingEnabled=false;cx.drawImage(lo,0,0,W,H);
    c.bx=Math.round(W*.5/cell)*cell;c.px=cell;cache.set(key,c);return c}
  const oFC=flowerCanvas,oSD=swayDraw,oDF=drawFlower;
  window.flowerCanvas=function(sp,U,c){return ready?sprite(sp,U,c):oFC(sp,U,c)};
  window.swayDraw=function(ctx,can,x,ground,now,o){if(!can||!can.px)return oSD(ctx,can,x,ground,now,o);o=o||{};
    const ph=o.ph||0,amp=(typeof reduce!=='undefined'&&reduce)?0:(o.amp??.035);
    if(o.st){const push=o.push||0;o.st.v=((o.st.v||0)+(push-(o.st.b||0))*.08)*.86;o.st.b=(o.st.b||0)+o.st.v}
    const a=Math.sin(now/1300+ph)*amp+Math.sin(now/530+ph*1.7)*amp*.35+(o.st?o.st.b||0:0),cell=can.px,H=can.height,x0=Math.round(x-can.bx);
    const prev=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=false;
    for(let y=H-cell;y>=0;y-=cell){const hgt=H-y,dx=Math.round(Math.sin(a)*hgt/cell)*cell;ctx.drawImage(can,0,y,can.width,cell,x0+dx,ground-hgt,can.width,cell)}
    ctx.imageSmoothingEnabled=prev};
  window.drawFlower=function(ctx,x,ground,U,sp,grow){if(!ready)return oDF(ctx,x,ground,U,sp,grow);const g=Math.max(0,Math.min(1,grow));if(g<=0)return ground;
    const can=sprite(sp,U,Math.max(3,Math.round(U/4.5))),cell=can.px,h=Math.max(cell,Math.round(can.height*g/cell)*cell),prev=ctx.imageSmoothingEnabled;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(can,0,can.height-h,can.width,h,Math.round(x-can.bx),ground-h,can.width,h);ctx.imageSmoothingEnabled=prev;return ground-h};
  // jardim com ~35% menos flores e respiro entre grupos
  if(typeof seedGarden==='function'){window.seedGarden=function(){plants=[];const now=gardenSeen?performance.now():1e12;const n=Math.max(5,Math.round(VW/165));
    for(let i=0;i<n;i++)plant(GU*2.6+i*(VW-GU*5.2)/(n-1)+Math.random()*40-20,now+i*140)}}
  // obstáculo: a cabeça do sprite ficou maior (caule curto), então a colisão alarga junto (R ×1,1); a altura fica no alcance do pulo
  if(typeof obstacle==='function'){const oOb=obstacle;window.obstacle=function(){const o=oOb();o.sp.R*=1.1;if(ready)o.can=window.flowerCanvas(o.sp,GUg,4);return o}}
  // fundo do jardim: fileira de trás em pixel (pálida) + tufos de grama em células, sem a grama de aquarela por cima dos sprites
  if(typeof meadowLayer==='function'){const oML=meadowLayer;window.meadowLayer=function(){if(!ready)return oML();const c=document.createElement('canvas');c.width=VW;c.height=GH;const x=c.getContext('2d');
    x.imageSmoothingEnabled=false;for(let i=0,n=Math.round(VW/120);i<n;i++){const sp=flowerSpec(9000+i*13,PAL_LIGHT);sp.h*=.7;const can=sprite(sp,GU*.55,GCELL);
      x.globalAlpha=.35;x.drawImage(can,Math.round(((i+.5)*VW/n-can.bx)/GCELL)*GCELL,GROUND-can.height);x.globalAlpha=1}
    const r=rng(77),G=['#3E5A35','#56744A','#6E8B5B'],u=GCELL;for(let gx=u;gx<VW;gx+=u*(3+Math.floor(r()*6))){const h=1+Math.floor(r()*3);x.fillStyle=G[Math.floor(r()*3)];
      x.fillRect(Math.round(gx/u)*u,GROUND-h*u,u,h*u);if(r()<.5)x.fillRect(Math.round(gx/u)*u+u,GROUND-(h-1)*u,u,(h-1)*u)}
    return c}}
  // carrega as pranchas; quando prontas, refaz os caches do jardim e do jogo
  Promise.all(Object.entries(FILES).map(([k,f])=>new Promise(res=>{const i=new Image();i.decoding='async';i.onload=()=>{IMG[k]=i;res()};i.onerror=res;i.src=B+f}))).then(()=>{
    if(!IMG.papoula||!IMG.centaurea||!IMG.margarida)return;ready=true;
    try{seedGarden()}catch(e){}try{plants.forEach(p=>p.can=null)}catch(e){}try{gMeadow=null}catch(e){}try{gScene=null}catch(e){}try{idleFl.length=0}catch(e){}
    try{game.obs.forEach(o=>{o.sp.R*=1.1;o.can=window.flowerCanvas(o.sp,GUg,4)})}catch(e){}});
})();
