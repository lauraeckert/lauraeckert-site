// Meta voice in the brand's pixel mono (effect inspired by radilson.com).
// [data-type] types in one line at a time with a block cursor that leaves when the line ends;
// [data-decode] settles from scrambled glyphs. Both start when the element scrolls into view.
// Screen readers get the final text from a visually hidden copy; the animated text is aria-hidden.
// With reduced motion the final markup shows at once.
(()=>{
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GL='#%&*+=<>/\\01'; // glyphs the pixel font has, so nothing falls back to a taller font
  if(!document.getElementById('fx-style')){const st=document.createElement('style');st.id='fx-style';
    st.textContent='.fx-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';document.head.append(st)}
  // the original markup is kept on the element so an effect can be replayed (window.FX)
  function prep(el){if(el._fxOrig===undefined)el._fxOrig=el.innerHTML;el.innerHTML=el._fxOrig;const html=el._fxOrig,txt=el.textContent;el.textContent='';
    const sr=document.createElement('span');sr.className='fx-sr';sr.textContent=txt;
    const vis=document.createElement('span');vis.setAttribute('aria-hidden','true');el.append(sr,vis);return {html,txt,vis}}
  // typing runs as a queue so only one line has a cursor at a time
  // one queue per section, so side-by-side columns type at the same time
  const queues=new Map();
  function type(el){const {html,txt,vis}=prep(el);
    if(RM){vis.innerHTML=html;return}
    const key=el.closest('section')||document;
    queues.set(key,(queues.get(key)||Promise.resolve()).then(()=>new Promise(done=>{let i=0;const t=document.createElement('span'),cur=document.createElement('span');cur.className='fx-cur';vis.append(t,cur);
      const step=()=>{t.textContent=txt.slice(0,++i);
        if(i<txt.length)setTimeout(step,txt[i-1]===' '?18:28+Math.random()*30);
        else{vis.innerHTML=html;const c=document.createElement('span');c.className='fx-cur';vis.append(c);done();setTimeout(()=>c.remove(),1200)}};
      setTimeout(step,+(el.dataset.delay||0))})))}
  function decode(el){const box=el.getBoundingClientRect();const {html,txt,vis}=prep(el);
    if(RM){vis.innerHTML=html;return}
    el.style.display=getComputedStyle(el).display==='inline'?'inline-block':'';el.style.minWidth=box.width+'px';el.style.height=box.height+'px';el.style.overflow='hidden';
    const t0=performance.now()+(+(el.dataset.delay||0)),dur=650+txt.length*45;
    const tick=now=>{const p=Math.max(0,(now-t0)/dur);let s='';
      for(let k=0;k<txt.length;k++){const c=txt[k];s+=c===' '||p*txt.length*1.25-k>3?c:GL[(Math.random()*GL.length)|0]}
      vis.textContent=s;if(p<1)requestAnimationFrame(tick);else{vis.innerHTML=html;el.style.height='';el.style.overflow=''}};
    requestAnimationFrame(tick)}
  window.FX={type,decode};
  const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){io.unobserve(e.target);(e.target.hasAttribute('data-decode')?decode:type)(e.target)}},{threshold:.6});
  const scan=()=>document.querySelectorAll('[data-type],[data-decode]').forEach(el=>io.observe(el));
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',scan):scan();
})();
