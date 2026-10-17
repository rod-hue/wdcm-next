/* WDCM NEXT: cinematic effects engine */
(function(){
  var G=window.gsap, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(G&&window.ScrollTrigger)G.registerPlugin(ScrollTrigger);
  var API='https://www.washingtondcmagazine.com/ghost/api/content/', KEY='6a3e40e14a8c49d7da3546ac98';
  function api(res,params){var u=new URL(API+res);u.searchParams.set('key',KEY);for(var k in params)u.searchParams.set(k,params[k]);return fetch(u).then(function(r){return r.json()})}
  function img(u,w){if(!u)return '';return u.indexOf('/content/images/')>-1&&u.indexOf('/size/')<0?u.replace('/content/images/','/content/images/size/w'+w+'/'):u}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  /* smooth scroll */
  var lenis=null;
  if(window.Lenis&&!reduce){lenis=new Lenis({lerp:.1,smoothWheel:true});window.__lenis=lenis;
    if(G){lenis.on('scroll',ScrollTrigger.update);G.ticker.add(function(t){lenis.raf(t*1000)});G.ticker.lagSmoothing(0)}
    else{(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(0)}}

  /* resolution-aware films */
  function pick(v){var b=v.dataset.q;if(!b)return;var px=innerWidth*Math.min(2,devicePixelRatio||1);v.src=b+(px>=2300?'-4k':px>=1000?'-hd':'-sd')+'.mp4'}
  document.querySelectorAll('video[data-q]').forEach(function(v){if(v.preload==='auto')pick(v);else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(!v.src)pick(v);v.play().catch(function(){})}else v.pause()})},{rootMargin:'300px'});io.observe(v)}});

  /* loader: DC draws itself, logo resolves, curtain lifts */
  var L=document.getElementById('loader');
  if(L){var seen=false;try{seen=sessionStorage.getItem('wdcm_ld')}catch(e){}
    if(seen||reduce||!G){L.remove();document.documentElement.classList.add('loaded');setTimeout(startCine,0)}
    else{try{sessionStorage.setItem('wdcm_ld','1')}catch(e){}if(lenis)lenis.stop();var o={v:0},n=document.getElementById('ldN');
      api('posts/',{limit:1,fields:'id'}).then(function(d){o.max=d.meta.pagination.total});
      G.timeline({onComplete:function(){L.remove();if(lenis)lenis.start();startCine()}})
        .to('.ld-path',{strokeDashoffset:0,duration:1.5,ease:'power2.inOut'})
        .to('.ld-path',{fill:'rgba(200,169,90,.08)',duration:.6},'-=.3')
        .to('.ld-cap',{opacity:1,duration:.3},'-=.5')
        .fromTo('.ld-ring',{opacity:.9,scale:1},{opacity:0,scale:6,duration:1.1,ease:'power2.out'},'-=.3')
        .to('.ld-logo',{opacity:1,y:0,duration:.8,ease:'power3.out'},'-=1')
        .to(o,{v:1,duration:1.1,ease:'power2.out',onUpdate:function(){n.textContent=Math.round(o.v*(o.max||1372)).toLocaleString()+' stories'}},'-=.9')
        .to(L,{clipPath:'inset(0 0 100% 0)',duration:1,ease:'expo.inOut'},'+=.25')}}
  else startCine();

  /* scroll-controlled film: the reader flies the drone down the Mall */
  function seq(){var pin=document.querySelector('.cine-pin');if(!pin||!G||reduce)return;var N=96,mob=innerWidth<760,dir=(window.WDCM_MEDIA||'assets/')+'seq/'+(mob?'hero-m':'hero')+'/';
    var cv=document.createElement('canvas');cv.className='cine-seq';pin.insertBefore(cv,pin.firstChild.nextSibling);var x=cv.getContext('2d'),imgs=[],cur=0,ready=false;
    function size(){var d=Math.min(2,devicePixelRatio||1);cv.width=innerWidth*d;cv.height=innerHeight*d;draw(cur)}
    function near(i){for(var k=0;k<N;k++){if(imgs[i-k]&&imgs[i-k].ok)return imgs[i-k];if(imgs[i+k]&&imgs[i+k].ok)return imgs[i+k]}return null}
    function draw(i){var im=near(i);if(!im)return;var W=cv.width,H=cv.height,r=Math.max(W/im.naturalWidth,H/im.naturalHeight),w=im.naturalWidth*r,h=im.naturalHeight*r;x.drawImage(im,(W-w)/2,(H-h)/2,w,h)}
    var order=[];for(var s=8;s>=1;s=s/2|0){for(var i=0;i<N;i+=s)if(order.indexOf(i)<0)order.push(i);if(s===1)break}
    order.forEach(function(i){var im=new Image();im.decoding='async';im.onload=function(){im.ok=1;if(!ready&&i===0){ready=true;cv.classList.add('on');size()}if(Math.abs(i-cur)<3)draw(cur)};im.src=dir+String(i+1).padStart(3,'0')+'.webp';imgs[i]=im});
    addEventListener('resize',size);
    ScrollTrigger.create({trigger:'#cine',start:'top top',end:'bottom bottom',onUpdate:function(st){var f=Math.min(N-1,Math.round(st.progress*1.15*(N-1)));if(f!==cur){cur=f;draw(f)}}})}
  /* cinematic masthead: zoom through the letters into the city */
  var cineStarted=false;
  function startCine(){if(cineStarted)return;cineStarted=true;var c=document.getElementById('cine');if(!c||!G||reduce)return;seq();
    var setO=function(){var d=document.querySelector('.knock .kdot'),k=document.querySelector('.knock');if(!d||!k)return;var r=d.getBoundingClientRect(),kr=k.getBoundingClientRect();var o=((r.left+r.width/2-kr.left)/kr.width*100).toFixed(2)+'% '+((r.top+r.height*.78-kr.top)/kr.height*100).toFixed(2)+'%';document.querySelectorAll('.knock').forEach(function(x){x.style.transformOrigin=o})};
    setO();addEventListener('resize',setO);if(document.fonts)document.fonts.ready.then(setO);
    G.from('.knock .k1,.knock .k2',{yPercent:30,opacity:0,duration:1.4,ease:'expo.out',stagger:.12});
    G.from('.cine-ui > *',{y:20,opacity:0,duration:1,ease:'power3.out',stagger:.1,delay:.5});
    G.timeline({scrollTrigger:{trigger:c,start:'top top',end:'bottom bottom',scrub:.6}})
      .to('.cine-ui',{opacity:0,y:-40,duration:.15},0)
      .to('.knock',{scale:60,duration:1,ease:'power3.in'},0)
      .to('.knock',{opacity:0,duration:.25},.72)
      .fromTo('.cine-vid',{scale:1.15},{scale:1,duration:1},0)}
  if(!L)startCine();

  /* masthead: dark glass over the films, cream elsewhere */
  var mast=document.getElementById('mast');
  if(mast&&document.body.classList.contains('home')){var DARK='.cine,.front,.room.ch,#dome,.pulse-band,.lead-wrap,.foot,.mq.gold,.band.rn,.scores,.games,.voices.vs';var tick=false;
    var upd=function(){tick=false;var y=mast.getBoundingClientRect().bottom+4,el=document.elementFromPoint(innerWidth/2,y);mast.classList.toggle('dark',!!(el&&el.closest(DARK)))};
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});setTimeout(upd,300)}
  if(false){
    ScrollTrigger.create({trigger:'#front',start:'bottom 70px',onEnter:function(){mast.classList.remove('dark')},onLeaveBack:function(){mast.classList.add('dark')}});
    var dk=function(){var d=document.getElementById('dome');if(!d)return;ScrollTrigger.create({trigger:d,start:'top 70px',end:'bottom 70px',onToggle:function(s){mast.classList.toggle('dark',s.isActive)}})};dk()}

  /* The Front Page: top stories rotation */
  var stage=document.getElementById('frStage');
  if(stage){api('posts/',{limit:5,filter:'tag:-dc-answers+feature_image:-null',fields:'id,title,slug,feature_image,custom_excerpt,primary_tag,published_at',include:'tags'}).then(function(d){var ps=d.posts||[];if(!ps.length)return;
    stage.innerHTML=ps.map(function(p,i){return '<article class="fr-slide'+(i?'':' on')+'"><div class="bg"><img src="'+img(p.feature_image,2000)+'" alt=""'+(i?' loading="lazy"':'')+'></div><div class="fr-copy"><span class="n">0'+(i+1)+'</span><span class="tagpill">'+esc(p.primary_tag?p.primary_tag.name:'News')+'</span><h2>'+esc(p.title).split(' ').map(function(w){return '<span class="w"><span>'+w+'</span></span>'}).join(' ')+'</h2><p>'+esc(p.custom_excerpt||'')+'</p></div><a class="cover" data-cursor="Read" href="'+(window.WDCM_LIVE?'/'+p.slug+'/':'article.html?s='+encodeURIComponent(p.slug))+'" aria-label="'+esc(p.title)+'"></a></article>'}).join('');
    var bars=document.getElementById('frBars');bars.innerHTML=ps.map(function(_,i){return '<button aria-label="Story '+(i+1)+'"><i></i></button>'}).join('');
    var slides=[].slice.call(stage.children),bs=[].slice.call(bars.children),cur=0,tl=null,DUR=3.4;
    function go(i,dir){var prev=slides[cur];cur=(i+slides.length)%slides.length;var s=slides[cur];
      bs.forEach(function(b,j){b.classList.toggle('done',j<cur);b.querySelector('i').style.transform=j<cur?'scaleX(1)':'scaleX(0)'});
      slides.forEach(function(x){x.style.zIndex=x===s?2:x===prev?1:0});
      if(G&&!reduce&&prev!==s){G.fromTo(s,{clipPath:dir<0?'inset(0 100% 0 0)':'inset(0 0 0 100%)'},{clipPath:'inset(0 0 0 0%)',duration:.8,ease:'expo.inOut',onComplete:function(){prev.classList.remove('on')}});
        G.from(s.querySelectorAll('h2 .w>span'),{yPercent:110,duration:1,ease:'expo.out',stagger:.025,delay:.3})}else if(prev!==s)prev.classList.remove('on');
      s.classList.add('on');
      if(tl)tl.kill();var bar=bs[cur].querySelector('i');if(G){tl=G.fromTo(bar,{scaleX:0},{scaleX:1,duration:DUR,ease:'none',onComplete:function(){go(cur+1,1)}})}}
    bs.forEach(function(b,j){b.onclick=function(){go(j,j<cur?-1:1)}});
    document.getElementById('frNext').onclick=function(){go(cur+1,1)};document.getElementById('frPrev').onclick=function(){go(cur-1,-1)};
    var front=document.getElementById('front');new IntersectionObserver(function(es){es.forEach(function(e){if(tl){e.isIntersecting?tl.resume():tl.pause()}})}).observe(front);
    var sx=0;front.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});front.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>50)go(cur+(dx<0?1:-1),dx<0?1:-1)});
    go(0,1)})}

  /* custom cursor */
  var cu=document.querySelector('.cursor');
  if(cu&&fine){var x=innerWidth/2,y=innerHeight/2,cx=x,cy=y,lab=cu.querySelector('b');
    addEventListener('mousemove',function(e){x=e.clientX;y=e.clientY});
    (function loop(){cx+=(x-cx)*.2;cy+=(y-cy)*.2;cu.style.transform='translate('+cx+'px,'+cy+'px)';requestAnimationFrame(loop)})();
    document.addEventListener('mouseover',function(e){var t=e.target.closest('.card,[data-cursor],.un,.ans,.author');if(t){cu.classList.add('big');lab.textContent=(t.dataset&&t.dataset.cursor)||(t.classList.contains('author')?'Profile':'Read')}else cu.classList.remove('big')})}

  /* liquid ripple on photo hover */
  var disp=document.querySelector('#liquid feDisplacementMap'),turb=document.querySelector('#liquid feTurbulence');
  if(false){var lq={s:0};document.addEventListener('mouseover',function(e){var c=e.target.closest('.card');if(!c||c.__lq)return;c.__lq=1;setTimeout(function(){c.__lq=0},900);
    turb.setAttribute('seed',Math.round(Math.random()*90));G.fromTo(lq,{s:0},{s:38,duration:.35,ease:'power2.out',yoyo:true,repeat:1,onUpdate:function(){disp.setAttribute('scale',lq.s.toFixed(1))}})})}

  /* card to article: the photo morphs into the article hero */
  document.addEventListener('click',function(e){var a=e.target.closest(window.WDCM_LIVE?'a[href^="/"]:not([href^="/tag/"]):not([href^="/author/"])':'a[href*="article.html"]');if(!a)return;var im=a.querySelector('.ph img')||(a.closest('.fr-slide')&&a.closest('.fr-slide').querySelector('.bg img'));
    document.querySelectorAll('[style*="view-transition-name"]').forEach(function(x){x.style.viewTransitionName=''});if(im)im.style.viewTransitionName='story'},true);

  /* film rooms + kinetic section heads (rooms load asynchronously) */
  var FILMS={};
  function upgrade(){
    Object.keys(FILMS).forEach(function(k){var r=document.getElementById('room-'+k);if(!r||r.classList.contains('film'))return;var f=FILMS[k];r.classList.add('film');
      var head=document.createElement('div');head.className='room-film';head.innerHTML='<video muted loop playsinline preload="none" poster="'+f.v+'.jpg" data-q="'+f.v+'"></video><div class="rf-copy"><span class="mono gold-txt">The Capitol beat</span><h2>'+f.t+'</h2></div>';
      var body=document.createElement('div');body.className='room-body';while(r.firstChild)body.appendChild(r.firstChild);r.appendChild(head);r.appendChild(body);
      var v=head.querySelector('video');new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){if(!v.src)pick(v);v.play().catch(function(){})}else v.pause()})},{rootMargin:'300px'}).observe(v);
      if(G&&!reduce)G.fromTo(v,{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:head,start:'top bottom',end:'bottom top',scrub:true}})});
    document.querySelectorAll('.kicker').forEach(function(k){if(k.__split||!G||reduce||k.querySelector('[id]'))return;k.__split=1;var star=k.querySelector('.star');var txt=k.textContent.trim();if(!txt)return;
      k.innerHTML='';if(star)k.appendChild(star);txt.split(' ').forEach(function(w,i){var s=document.createElement('span');s.className='ch';s.innerHTML='<span>'+esc(w)+'</span>';k.appendChild(s);if(i<txt.split(' ').length-1)k.appendChild(document.createTextNode(' '))});
      G.from(k.querySelectorAll('.ch>span'),{yPercent:105,duration:1,ease:'expo.out',stagger:.06,scrollTrigger:{trigger:k,start:'top 90%',once:true}})});
  }
  new MutationObserver(function(){clearTimeout(upgrade.t);upgrade.t=setTimeout(upgrade,120)}).observe(document.body,{childList:true,subtree:true});upgrade();

  /* ===== article: mood color + scroll storytelling ===== */
  if(document.body.classList.contains('post')){
    var wash=document.createElement('div');wash.className='mood-wash';document.body.prepend(wash);
    var done=false;
    function enhance(){var c=document.getElementById('content');if(done||!c||!c.children.length)return;done=true;
      /* mood: sample the hero photo */
      var hi=document.querySelector('.phero .bg img');if(hi){var go=function(){try{var cv=document.createElement('canvas');cv.width=cv.height=24;var x=cv.getContext('2d');x.drawImage(hi,0,0,24,24);var d=x.getImageData(0,0,24,24).data,r=0,g=0,b=0,n=0;for(var i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++}r/=n;g/=n;b/=n;
        var mx=Math.max(r,g,b)||1;var dk=[r,g,b].map(function(v){return Math.round(v/mx*38+6)});var lt=[r,g,b].map(function(v){return Math.round(110+v/mx*120)});
        document.body.style.setProperty('--mood',dk.join(','));document.body.style.setProperty('--moodl',lt.join(','))}catch(e){}};
        hi.crossOrigin='anonymous';if(hi.complete&&hi.naturalWidth){var t=new Image();t.crossOrigin='anonymous';t.onload=function(){hi=t;go()};t.src=hi.src}else hi.addEventListener('load',go)}
      if(!G||reduce)return;
      c.querySelectorAll('figure').forEach(function(f){f.classList.add('rv');var im=f.querySelector('img');
        G.to(f,{clipPath:'inset(0% 0% 0% 0% round 6px)',duration:1.3,ease:'expo.out',scrollTrigger:{trigger:f,start:'top 85%',once:true}});
        if(im)G.to(im,{scale:1,duration:1.6,ease:'expo.out',scrollTrigger:{trigger:f,start:'top 85%',once:true}})});
      var hs=[].slice.call(c.querySelectorAll('h2,h3'));hs.forEach(function(h){h.classList.add('rv');G.to(h,{opacity:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:h,start:'top 88%',once:true}})});
      c.querySelectorAll('blockquote').forEach(function(q){var w=q.textContent.trim().split(/\s+/);q.innerHTML=w.map(function(x){return '<span style="display:inline-block;opacity:.12">'+esc(x)+'</span>'}).join(' ');
        G.to(q.querySelectorAll('span'),{opacity:1,stagger:.06,ease:'none',scrollTrigger:{trigger:q,start:'top 80%',end:'bottom 45%',scrub:true}})});
      /* chapter navigator */
      if(hs.length>=2){var nav=document.createElement('nav');nav.className='chapters';nav.setAttribute('aria-label','Chapters');
        nav.innerHTML=hs.map(function(h,i){h.id=h.id||'ch-'+i;return '<a href="#'+h.id+'"><i></i>'+esc(h.textContent)+'</a>'}).join('');document.body.appendChild(nav);
        var as=[].slice.call(nav.children);as.forEach(function(a,i){a.onclick=function(e){e.preventDefault();if(lenis)lenis.scrollTo(hs[i],{offset:-90});else hs[i].scrollIntoView({behavior:'smooth'})}});
        ScrollTrigger.create({trigger:c,start:'top 40%',end:'bottom 60%',onToggle:function(s){nav.classList.toggle('on',s.isActive)}});
        hs.forEach(function(h,i){ScrollTrigger.create({trigger:h,start:'top 50%',endTrigger:hs[i+1]||c,end:hs[i+1]?'top 50%':'bottom 50%',onToggle:function(s){if(s.isActive)as.forEach(function(a,j){a.classList.toggle('on',j===i)})}})})}
      ScrollTrigger.refresh()}
    new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
  }
})();
