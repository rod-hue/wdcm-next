/* WDCM NEXT: motion graphics layer v3 (auto-generated story graphics, boxes in motion) */
(function(){
  var G=window.gsap, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!G||reduce)return;
  var API='https://www.washingtondcmagazine.com/ghost/api/content/', KEY='6a3e40e14a8c49d7da3546ac98';
  function api(res,params){var u=new URL(API+res);u.searchParams.set('key',KEY);for(var k in params)u.searchParams.set(k,params[k]);return fetch(u).then(function(r){return r.json()})}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var STOP={'by':1,'for':1,'the':1,'a':1,'an':1,'of':1,'in':1,'to':1,'and':1,'on':1,'at':1,'with':1,'from':1,'that':1,'is':1,'was':1,'it':1,'as':1,'or':1};

  /* ---------- 3D tilt + glare on every card (site-wide) ---------- */
  if(fine){document.addEventListener('mousemove',function(e){var c=e.target.closest('.card .ph,.dbox,.statbox,.un,.bt');if(!c)return;var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      c.style.setProperty('--gx',(x*100).toFixed(1)+'%');c.style.setProperty('--gy',(y*100).toFixed(1)+'%');
      });
    document.addEventListener('mouseout',function(e){var c=e.target.closest('.card .ph');if(c&&!c.contains(e.relatedTarget))c.style.transform=''})}

  /* ---------- reveal any new boxes as they enter ---------- */
  function boxIn(sel,root){(root||document).querySelectorAll(sel).forEach(function(el,i){if(el.__in)return;el.__in=1;
    G.fromTo(el,{y:60,opacity:0,rotateX:-12,transformPerspective:900},{y:0,opacity:1,rotateX:0,duration:1.1,ease:'expo.out',delay:(i%4)*.08,scrollTrigger:{trigger:el,start:'top 92%',once:true}})})}

  /* ---------- section marquee bands ---------- */
  function marquee(words,cls){var m=document.createElement('div');m.className='mq '+(cls||'');var t=words.map(function(w,i){return '<span'+(i%2?' class="o"':'')+'>'+esc(w)+'</span><i>&#9670;</i>'}).join('');m.innerHTML='<div class="mq-t">'+t+t+t+'</div>';
    G.to(m.querySelector('.mq-t'),{xPercent:cls==='rev'?33.33:-33.33,ease:'none',duration:38,repeat:-1});
    var v={s:0};ScrollTrigger.create({trigger:m,start:'top bottom',end:'bottom top',onUpdate:function(s){var sk=G.utils.clamp(-8,8,s.getVelocity()/-300);G.to(m.querySelector('.mq-t'),{skewX:sk,duration:.4,overwrite:'auto'})}});return m}

  /* =================== HOMEPAGE =================== */
  if(document.body.classList.contains('home')){
    /* channels: film plays when on screen; 3D print stack straightens and fans out with scroll; giant title glides */
    document.addEventListener('wdcm:room',function(e){var s=e.detail,v=s.querySelector('.ch-bg video');
      if(v){var pick=function(){var px=innerWidth*Math.min(2,devicePixelRatio||1);v.src=v.dataset.q+(px>=1000?'-hd':'-sd')+'.mp4'};
        new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){if(!v.src)pick();v.play().catch(function(){})}else v.pause()})},{rootMargin:'200px'}).observe(v)}
      G.fromTo(s.querySelector('.ch-bg'),{yPercent:-8},{yPercent:8,ease:'none',scrollTrigger:{trigger:s,start:'top bottom',end:'bottom top',scrub:true}});
      G.fromTo(s.querySelector('.ch-giant'),{xPercent:10},{xPercent:-40,ease:'none',scrollTrigger:{trigger:s,start:'top bottom',end:'bottom top',scrub:true}});
      var lead=s.querySelector('.ch-lead-wrap');if(lead)G.fromTo(lead,{y:80,scale:.94},{y:0,scale:1,ease:'none',scrollTrigger:{trigger:s,start:'top 95%',end:'center 55%',scrub:1}});
      var rv=s.querySelectorAll('.rv');if(rv.length)G.from(rv,{y:60,opacity:0,duration:1.1,ease:'expo.out',stagger:.08,scrollTrigger:{trigger:s.querySelector('.ch-stage'),start:'top 82%',once:true}});
      s.querySelectorAll('[data-speed]').forEach(function(el){var sp=+el.dataset.speed;if(sp&&innerWidth>760)G.fromTo(el,{y:-sp*400},{y:sp*400,ease:'none',scrollTrigger:{trigger:s,start:'top bottom',end:'bottom top',scrub:true}})});
      G.from(s.querySelectorAll('.ch-head > *'),{y:40,opacity:0,duration:1,ease:'expo.out',stagger:.08,scrollTrigger:{trigger:s,start:'top 75%',once:true}});
      G.from(s.querySelectorAll('.ch-item'),{x:80,opacity:0,duration:1,ease:'expo.out',stagger:.1,scrollTrigger:{trigger:s.querySelector('.ch-list'),start:'top 85%',once:true}});
      ScrollTrigger.refresh()});
    /* section marquees between rooms */
    var ins=0,mo=new MutationObserver(function(){var rooms=document.querySelectorAll('.room');if(rooms.length>=4&&!ins){ins=1;
      rooms[1].parentNode.insertBefore(marquee(['Politics','National','Sports','Business','Culture','Food & Drink','DC Answers'],''),rooms[1]);
      rooms[3].parentNode.insertBefore(marquee(['Washington DC Magazine','The capital, live','Every story, every hour'],'rev gold'),rooms[3]);mo.disconnect()}});
    mo.observe(document.body,{childList:true,subtree:true});

    /* THE DOME: the sculpture turns with your scroll, eased frame to frame; words pass behind it */
    (function(){var cv=document.getElementById('domeCv');if(!cv)return;var N=120,mob=innerWidth<760,dir=(window.WDCM_DOME||(window.WDCM_MEDIA||'assets/')+'seq/')+(mob?'dome-m':'dome')+'/',x=cv.getContext('2d'),imgs=[],shown=-1,want=0,pos=0;
      cv.width=mob?640:1080;cv.height=cv.width;
      function near(i){for(var k=0;k<N;k++){if(imgs[i-k]&&imgs[i-k].ok)return imgs[i-k];if(imgs[i+k]&&imgs[i+k].ok)return imgs[i+k]}return null}
      function draw(i){var im=near(i);if(!im)return;x.clearRect(0,0,cv.width,cv.height);var w=im.naturalWidth*cv.height/im.naturalHeight;x.drawImage(im,(cv.width-w)/2,0,w,cv.height);shown=i;cv.classList.add('ready')}
      /* first frame first, then a coarse pass round the whole turn, then every frame */
      var order=[0];[8,4,2,1].forEach(function(s){for(var i=0;i<N;i+=s)if(order.indexOf(i)<0)order.push(i)});
      order.forEach(function(i){var im=new Image();im.decoding='async';im.onload=function(){im.ok=1;if(shown<0||Math.abs(i-Math.round(pos))<3)draw(Math.round(pos))};im.src=dir+String(i+1).padStart(3,'0')+'.webp';imgs[i]=im});
      var words=[].slice.call(document.querySelectorAll('.dome-words span')),lines=[].slice.call(document.querySelectorAll('.dome-line'));if(lines[0])lines[0].classList.add('on');
      ScrollTrigger.create({trigger:'#dome',start:'top top',end:'bottom bottom',onUpdate:function(st){var p=st.progress;want=p*(N-1);
        var seg=Math.min(2,Math.floor(p*3));words.forEach(function(w,i){var local=p*3-i;w.style.opacity=i===seg?Math.max(0,Math.min(1,local<.5?local*2.2:(1-local)*2.2)):0;w.style.transform='translateX('+((.5-local)*30)+'vw) scale('+(1+local*.15)+')'});
        lines.forEach(function(l,i){l.classList.toggle('on',i<=seg)})}});
      /* glide toward the scroll position instead of jumping, so the turn stays smooth at any scroll speed */
      (function loop(){requestAnimationFrame(loop);var d=want-pos;if(Math.abs(d)<.02)return;pos+=d*.09;var f=Math.round(pos);if(f!==shown)draw(f)})()})();
  }

  /* =================== ARTICLE =================== */
  if(!document.body.classList.contains('post'))return;
  var built=false;
  var obs=new MutationObserver(function(){var c=document.getElementById('content');if(built||!c||c.children.length<3||!document.querySelector('.phero .bg img'))return;built=true;obs.disconnect();setTimeout(build,60)});
  obs.observe(document.body,{childList:true,subtree:true});

  function build(){
    var c=document.getElementById('content'),hero=document.querySelector('.phero'),hi=hero.querySelector('.bg img');
    /* hero: the photo opens from a framed box to full screen, then parallaxes */
    var bg=hero.querySelector('.bg');
    G.fromTo(bg,{clipPath:'inset(16% 12% 16% 12% round 28px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',duration:1.8,ease:'expo.inOut',delay:.1});
    G.fromTo(hi,{scale:1.35},{scale:1.06,duration:2.4,ease:'expo.out',delay:.1});
    var frame=document.createElement('div');frame.className='hframe';hero.appendChild(frame);
    G.fromTo(frame,{opacity:1,clipPath:'inset(16% 12% 16% 12% round 28px)'},{clipPath:'inset(3% 2.5% 3% 2.5% round 18px)',opacity:.9,duration:1.8,ease:'expo.inOut',delay:.1});
    G.to(bg,{yPercent:18,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
    G.to(hero.querySelector('.ph-copy'),{yPercent:-30,opacity:0,ease:'none',scrollTrigger:{trigger:hero,start:'35% top',end:'bottom top',scrub:true}});
    G.from(hero.querySelectorAll('.tagpill,.dek,.by'),{y:30,opacity:0,duration:1,ease:'power3.out',stagger:.12,delay:.9});

    var text=c.innerText||'', ps=[].slice.call(c.querySelectorAll(':scope > p'));

    /* PULL QUOTE: the strongest quote becomes a motion card */
    var qs=(text.match(/["“]([^"”]{60,230})["”]/g)||[]).map(function(q){return q.slice(1,-1).replace(/,\s*$/,'.')});
    if(qs.length&&ps.length>5){var q=qs[0],card=document.createElement('figure');card.className='pq';
      card.innerHTML='<span class="pq-mark">&ldquo;</span><blockquote>'+q.split(' ').map(function(w){return '<span>'+esc(w)+'</span>'}).join(' ')+'</blockquote><figcaption class="mono">From the story</figcaption>';
      ps[Math.floor(ps.length*.45)].after(card);
      G.fromTo(card.querySelectorAll('blockquote span'),{opacity:.12,y:8},{opacity:1,y:0,stagger:.05,ease:'none',scrollTrigger:{trigger:card,start:'top 78%',end:'bottom 50%',scrub:true}});
      G.fromTo(card.querySelector('.pq-mark'),{scale:.4,rotate:-20,opacity:0},{scale:1,rotate:0,opacity:1,duration:1.4,ease:'expo.out',scrollTrigger:{trigger:card,start:'top 85%',once:true}})}

    /* CINEMATIC PAUSE: the photo returns, framed, zooming as you scroll */
    if(ps.length>7&&hi&&(hi.currentSrc||hi.getAttribute('src'))){var pz=document.createElement('figure');pz.className='pause';
      pz.innerHTML='<div class="pz-frame"><img src="'+(hi.currentSrc||hi.getAttribute('src')||'').replace(/\/size\/w\d+\//,'/size/w2000/')+'" alt=""></div>'+(document.querySelector('.phero .cap')?'<figcaption class="mono">'+esc(document.querySelector('.phero .cap').textContent)+'</figcaption>':'');
      ps[Math.floor(ps.length*.72)].after(pz);
      G.fromTo(pz.querySelector('.pz-frame'),{clipPath:'inset(18% 22% 18% 22% round 24px)'},{clipPath:'inset(0% 0% 0% 0% round 14px)',ease:'none',scrollTrigger:{trigger:pz,start:'top 90%',end:'center 50%',scrub:true}});
      G.fromTo(pz.querySelector('img'),{scale:1.45},{scale:1,ease:'none',scrollTrigger:{trigger:pz,start:'top bottom',end:'bottom top',scrub:true}})}

    /* paragraphs rise in; subheads get a drawn gold divider */
    ps.forEach(function(p){G.from(p,{y:26,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:p,start:'top 92%',once:true}})});
    c.querySelectorAll('h2,h3').forEach(function(h){var d=document.createElement('div');d.className='divider';d.innerHTML='<i></i><b></b><i></i>';h.before(d);
      G.fromTo(d.querySelectorAll('i'),{scaleX:0},{scaleX:1,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:d,start:'top 90%',once:true}});
      G.fromTo(d.querySelector('b'),{scale:0,rotate:0},{scale:1,rotate:45,duration:.9,ease:'back.out(2)',delay:.2,scrollTrigger:{trigger:d,start:'top 90%',once:true}})});
    /* first sentence of each section gets a gold highlight sweep */
    c.querySelectorAll('h2 + p, h3 + p').forEach(function(p){var s=p.innerHTML.match(/^(.*?[.!?])(\s|$)/);if(!s||s[1].length>220)return;p.innerHTML='<mark class="sweep">'+s[1]+'</mark>'+p.innerHTML.slice(s[1].length);
      G.fromTo(p.querySelector('.sweep'),{backgroundSize:'0% 38%'},{backgroundSize:'100% 38%',duration:1.4,ease:'power2.inOut',scrollTrigger:{trigger:p,start:'top 80%',once:true}})});

    /* moving marquee before Up next */
    var un=document.getElementById('upnext');if(un){var sec=(document.getElementById('mbSec')||{}).textContent||'Washington DC Magazine';un.before(marquee(['Keep reading',sec,'Washington DC Magazine','The capital, live'],'gold'))}
    /* related become boxes in motion */
    var rel=new MutationObserver(function(){if(document.querySelectorAll('#related .card').length){rel.disconnect();boxIn('#related .card')}});rel.observe(document.getElementById('related'),{childList:true});
    ScrollTrigger.refresh();
  }
})();
