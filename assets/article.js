/* WDCM NEXT: article page */
(function(){
  var API='https://www.washingtondcmagazine.com/ghost/api/content/', KEY='6a3e40e14a8c49d7da3546ac98', LIVE='https://www.washingtondcmagazine.com';
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function api(res,params){var u=new URL(API+res);u.searchParams.set('key',KEY);for(var k in params)u.searchParams.set(k,params[k]);return fetch(u).then(function(r){return r.json()})}
  function img(u,w){if(!u)return '';if(u.indexOf('/content/images/')>-1&&u.indexOf('/size/')<0)return u.replace('/content/images/','/content/images/size/w'+w+'/');return u}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(d){var s=(Date.now()-new Date(d))/1000;if(s<3600)return Math.max(1,Math.floor(s/60))+' min ago';if(s<86400)return Math.floor(s/3600)+' hr ago';var n=Math.floor(s/86400);return n===1?'Yesterday':n+' days ago'}
  function dt(d){return new Date(d).toLocaleString('en-US',{month:'long',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/New_York'})+' ET'}
  function link(p){return 'article.html?s='+encodeURIComponent(p.slug)}
  function card(p){return '<a class="card" href="'+link(p)+'"><div class="ph">'+(p.feature_image?'<img loading="lazy" src="'+img(p.feature_image,800)+'" alt="">':'')+'</div><div class="tx"><span class="sec">'+esc(p.primary_tag?p.primary_tag.name:'News')+'</span><h3>'+esc(p.title)+'</h3><span class="ago">'+ago(p.published_at)+'</span></div></a>'}

  /* clock + nav shared with home */
  var NAV=[['Politics','politics'],['National','national-news'],['Sports','dc-sports'],['Business','business'],['Culture','culture'],['Food & Drink','food-drink'],['DC Answers','dc-answers']];
  var nav=document.getElementById('sectionsNav');if(nav)nav.innerHTML=NAV.map(function(n){return '<a href="./#room-'+n[1]+'">'+n[0]+'</a>'}).join('');
  function tick(){var el=document.getElementById('sysClock');if(el)el.textContent='Washington, DC  '+new Date().toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/New_York'})}tick();setInterval(tick,15000);
  fetch('https://api.open-meteo.com/v1/forecast?latitude=38.9072&longitude=-77.0369&current=temperature_2m&temperature_unit=fahrenheit').then(function(r){return r.json()}).then(function(d){document.getElementById('sysWeather').textContent=Math.round(d.current.temperature_2m)+'°F'}).catch(function(){});
  api('posts/',{limit:12,fields:'title,slug,published_at',filter:'tag:-dc-answers'}).then(function(d){var t=(d.posts||[]).map(function(p){return '<a href="'+link(p)+'"><b>'+new Date(p.published_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/New_York'})+'</b>'+esc(p.title)+'</a>'}).join('');document.getElementById('ticker').innerHTML=t+t;if(d.posts&&d.posts[0])document.getElementById('sysFresh').textContent='Updated '+ago(d.posts[0].published_at).toLowerCase()});
  var mast=document.getElementById('mast');

  var slug=new URLSearchParams(location.search).get('s');
  var P=null;
  (slug?api('posts/slug/'+encodeURIComponent(slug)+'/',{include:'tags,authors',formats:'html'}):api('posts/',{limit:1,include:'tags,authors',formats:'html',filter:'tag:-dc-answers'})).then(function(d){
    P=d.posts&&d.posts[0];if(!P){document.getElementById('content').innerHTML='<p>Story not found.</p>';return}
    /* some older stories keep their full, photo-rich body in a post-fallback block on the live site; use it */
    api('settings/',{}).then(function(s){var foot=(s&&s.settings&&s.settings.codeinjection_foot)||'';
      if(foot.indexOf('data-slug="'+P.slug+'"')>-1){var doc=new DOMParser().parseFromString(foot,'text/html'),fb=doc.querySelector('.wdcm-post-fallback[data-slug="'+P.slug+'"]');
        if(fb){fb.querySelectorAll('[data-wdcmfb-marker],script,style').forEach(function(e){e.remove()});if(fb.innerHTML.trim().length>200)P.html=fb.innerHTML}}
      render(P)}).catch(function(){render(P)});
  });

  function render(p){
    document.title=p.title+' | Washington DC Magazine';
    var sec=p.primary_tag?p.primary_tag.name:'News', au=(p.authors||[])[0]||{name:'WDCM Editorial'};
    var brk=(p.tags||[]).some(function(t){return t.slug==='breaking'});
    var upd=p.updated_at&&(new Date(p.updated_at)-new Date(p.published_at)>15*60e3);
    var hero=document.getElementById('phero');
    hero.innerHTML=(p.feature_image?'<div class="bg"><img src="'+img(p.feature_image,2000)+'" alt="'+esc(p.feature_image_alt||'')+'"></div>':'')+
      '<div class="ph-copy"><a class="tagpill'+(brk?' breaking':'')+'" href="'+LIVE+'/tag/'+(p.primary_tag?p.primary_tag.slug:'')+'/">'+(brk?'Breaking':esc(sec))+'</a>'+
      '<h1>'+esc(p.title).split(' ').map(function(w){return '<span class="w"><span>'+w+'</span></span>'}).join(' ')+'</h1>'+
      (p.custom_excerpt?'<p class="dek">'+esc(p.custom_excerpt)+'</p>':'')+
      '<div class="by"><span class="av">'+(au.profile_image?'<img src="'+img(au.profile_image,120)+'" alt="">':esc(au.name.charAt(0)))+'</span><div><b>By '+esc(au.name)+'</b><span class="mono">'+dt(p.published_at)+(upd?' &middot; Updated '+ago(p.updated_at):'')+' &middot; '+(p.reading_time||1)+' min read</span></div></div></div>'+
      (p.feature_image_caption?'<div class="cap mono">'+p.feature_image_caption.replace(/<[^>]+>/g,'')+'</div>':'');
    if(window.gsap&&!reduce)gsap.from(hero.querySelectorAll('h1 .w>span'),{yPercent:110,duration:1.1,ease:'expo.out',stagger:.035,delay:.1});
    var c=document.getElementById('content');c.innerHTML=p.html||'';
    /* the publisher repeats the headline inside the body; drop it */
    var norm=function(s){return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'')};
    var first=c.firstElementChild;if(first&&/^H[1-3]$/.test(first.tagName)&&norm(first.textContent)===norm(p.title))first.remove();
    document.getElementById('mbSec').textContent=sec;document.getElementById('mbTitle').textContent=p.title;
    document.getElementById('ptags').innerHTML=(p.tags||[]).filter(function(t){return t.visibility==='public'&&!/^evdate-/.test(t.slug)}).slice(0,8).map(function(t){return '<a href="'+LIVE+'/tag/'+t.slug+'/">'+esc(t.name)+'</a>'}).join('');
    document.getElementById('authorCard').innerHTML='<span class="av">'+(au.profile_image?'<img src="'+img(au.profile_image,200)+'" alt="">':esc(au.name.charAt(0)))+'</span><div><span class="mono gold-txt">Written by</span><b>'+esc(au.name)+'</b><p>'+esc(au.bio||'Reporting from the nation’s capital for Washington DC Magazine.')+'</p></div>';
    var url=LIVE+'/'+p.slug+'/', t=encodeURIComponent(p.title), u=encodeURIComponent(url);
    document.getElementById('shX').href='https://twitter.com/intent/tweet?text='+t+'&url='+u;
    document.getElementById('shFb').href='https://www.facebook.com/sharer/sharer.php?u='+u;
    document.getElementById('shIn').href='https://www.linkedin.com/sharing/share-offsite/?url='+u;
    document.getElementById('shWa').href='https://wa.me/?text='+t+'%20'+u;
    document.getElementById('shCopy').onclick=function(){navigator.clipboard.writeText(url);this.classList.add('ok');var b=this;setTimeout(function(){b.classList.remove('ok')},1600)};
    /* audio: use the article's own voiceover if it has one, otherwise the browser voice */
    var m=(p.codeinjection_head||'').match(/name=["']wdcm-audio["'][^>]*content=["']([^"']+)/)||(p.codeinjection_head||'').match(/content=["']([^"']+\.mp3)["']/);
    /* older stories carry their voiceover as an in-body player: lift it into the new Listen button */
    var oldPl=document.querySelector('#content [data-wdcm-listen], #content .wdcm-listen-v1'),oldSrc=null;
    if(oldPl){var oa=oldPl.querySelector('audio');oldSrc=oa&&(oa.getAttribute('src')||(oa.querySelector('source')||{}).src);oldPl.remove()}
    setupListen(m?m[1]:oldSrc);
    related(p);progress();
  }

  function related(p){
    var f=p.primary_tag?'primary_tag:'+p.primary_tag.slug+'+id:-'+p.id:'id:-'+p.id;
    document.getElementById('relSec').textContent=p.primary_tag?p.primary_tag.name:'WDCM';
    api('posts/',{limit:4,filter:f+'+feature_image:-null',fields:'id,title,slug,published_at,feature_image,primary_tag',include:'tags'}).then(function(d){document.getElementById('related').innerHTML=(d.posts||[]).map(card).join('')});
    api('posts/',{limit:1,filter:'id:-'+p.id+'+tag:-dc-answers+feature_image:-null+published_at:<\''+p.published_at+'\'',fields:'title,slug,feature_image,custom_excerpt,primary_tag,published_at',include:'tags'}).then(function(d){var n=d.posts&&d.posts[0];if(!n)return;
      document.getElementById('upnext').innerHTML='<a href="'+link(n)+'" class="un"><div class="bg"><img loading="lazy" src="'+img(n.feature_image,2000)+'" alt=""></div><div class="un-copy"><span class="mono gold-txt">Up next</span><h2>'+esc(n.title)+'</h2><p>'+esc(n.custom_excerpt||'')+'</p></div></a>'});
  }

  /* reading progress + minutes left */
  function progress(){var c=document.getElementById('content'),bar=document.getElementById('rbar'),mb=document.getElementById('minibar'),left=document.getElementById('mbLeft');
    var words=(c.innerText||'').split(/\s+/).length;
    function f(){var r=c.getBoundingClientRect(),h=r.height-innerHeight*.5,p=Math.min(1,Math.max(0,-r.top/Math.max(1,h)));bar.style.transform='scaleX('+p+')';
      mb.classList.toggle('on',scrollY>innerHeight*.75&&p<1);mast.classList.toggle('hide',scrollY>innerHeight*.75);var m=Math.ceil(words*(1-p)/230);left.textContent=p>=.99?'Finished':m+' min left'}
    addEventListener('scroll',f,{passive:true});f()}

  /* listen */
  function setupListen(src){var b=document.getElementById('listenBtn'),lab=b.querySelector('span'),au=null,speaking=false;
    b.onclick=function(){
      if(src){if(!au){au=new Audio(src)}if(au.paused){au.play();b.classList.add('on');lab.textContent='Pause'}else{au.pause();b.classList.remove('on');lab.textContent='Resume listening'}au.onended=function(){b.classList.remove('on');lab.textContent='Listen again'};return}
      var ss=window.speechSynthesis;if(!ss)return;
      if(speaking){ss.cancel();speaking=false;b.classList.remove('on');lab.textContent='Listen to this story';return}
      var txt=(P.title+'. '+document.getElementById('content').innerText).replace(/\s+/g,' ');var parts=txt.match(/[^.!?]+[.!?]+/g)||[txt];
      parts.forEach(function(s,i){var u=new SpeechSynthesisUtterance(s);u.rate=1.02;if(i===parts.length-1)u.onend=function(){speaking=false;b.classList.remove('on');lab.textContent='Listen again'};ss.speak(u)});
      speaking=true;b.classList.add('on');lab.textContent='Stop listening'}}

  /* text size */
  var ts=+(localStorage.getItem('wdcm-ts')||0);function applyTs(){document.documentElement.style.setProperty('--ts',ts)}applyTs();
  document.getElementById('tsPlus').onclick=function(){ts=Math.min(3,ts+1);applyTs();try{localStorage.setItem('wdcm-ts',ts)}catch(e){}};
  document.getElementById('tsMinus').onclick=function(){ts=Math.max(-1,ts-1);applyTs();try{localStorage.setItem('wdcm-ts',ts)}catch(e){}};

  /* ===== Share your feature studio ===== */
  var studio=document.getElementById('studio'),cv=document.getElementById('cv'),fmt='post',logo=new Image();logo.src='assets/logo-light@2x.png';
  var SIZES={post:[1080,1350],story:[1080,1920],wide:[1200,630]};
  function openStudio(){if(!P)return;studio.hidden=false;draw()}
  document.getElementById('featBtn').onclick=openStudio;document.getElementById('featBtn2').onclick=openStudio;
  document.getElementById('studioX').onclick=function(){studio.hidden=true};studio.addEventListener('click',function(e){if(e.target===studio)studio.hidden=true});
  document.querySelectorAll('#fmt button').forEach(function(b){b.onclick=function(){document.querySelectorAll('#fmt button').forEach(function(x){x.classList.toggle('on',x===b)});fmt=b.dataset.f;draw()}});
  var photo=null,photoFor=null;
  function wrap(ctx,text,maxW){var w=text.split(' '),lines=[],l='';w.forEach(function(x){var t=l?l+' '+x:x;if(ctx.measureText(t).width>maxW&&l){lines.push(l);l=x}else l=t});if(l)lines.push(l);return lines}
  function draw(){var W=SIZES[fmt][0],H=SIZES[fmt][1];cv.width=W;cv.height=H;var x=cv.getContext('2d');
    var go=function(){x.fillStyle='#0b1428';x.fillRect(0,0,W,H);
      if(photo){var ir=photo.width/photo.height,cr=W/H,sw,sh,sx,sy;if(ir>cr){sh=photo.height;sw=sh*cr;sx=(photo.width-sw)/2;sy=0}else{sw=photo.width;sh=sw/cr;sx=0;sy=(photo.height-sh)*.3}x.drawImage(photo,sx,sy,sw,sh,0,0,W,H)}
      var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(11,20,40,.55)');g.addColorStop(.35,'rgba(11,20,40,.05)');g.addColorStop(.55,'rgba(11,20,40,.55)');g.addColorStop(1,'rgba(11,20,40,.97)');x.fillStyle=g;x.fillRect(0,0,W,H);
      var pad=fmt==='wide'?56:72, s=fmt==='wide'?.8:1;
      /* gold frame */
      x.strokeStyle='rgba(200,169,90,.85)';x.lineWidth=3;x.strokeRect(pad/2,pad/2,W-pad,H-pad);
      /* top: as featured in + logo */
      x.fillStyle='#e6d3a0';x.font='600 '+Math.round(22*s)+'px "Inter Tight", sans-serif';x.textBaseline='top';
      if(logo.complete&&logo.naturalWidth){var lw=fmt==='wide'?420:560,lh=lw*logo.naturalHeight/logo.naturalWidth;x.letterSpacing='6px';x.fillText('AS FEATURED IN',pad+6,pad+10);x.letterSpacing='0px';x.drawImage(logo,pad,pad+52*s,lw,lh)}
      /* bottom: section, headline, date */
      var fs=fmt==='story'?84:fmt==='post'?72:52;x.font='700 '+fs+'px "Playfair Display", serif';var maxW=W-pad*2-12,lines=wrap(x,P.title,maxW);
      while(lines.length>(fmt==='wide'?3:5)&&fs>36){fs-=4;x.font='700 '+fs+'px "Playfair Display", serif';lines=wrap(x,P.title,maxW)}
      var lh2=fs*1.12,by=H-pad-40*s-lines.length*lh2-30;x.textBaseline='alphabetic';
      x.fillStyle='#c8a95a';x.font='600 '+Math.round(24*s)+'px "Inter Tight", sans-serif';x.letterSpacing='5px';x.fillText((P.primary_tag?P.primary_tag.name:'News').toUpperCase(),pad+6,by-18);x.letterSpacing='0px';
      x.fillStyle='#f6f2ea';x.font='700 '+fs+'px "Playfair Display", serif';lines.forEach(function(l,i){x.fillText(l,pad+6,by+fs+i*lh2)});
      x.fillStyle='rgba(246,242,234,.75)';x.font='500 '+Math.round(24*s)+'px "Inter Tight", sans-serif';
      x.fillText(new Date(P.published_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+'  ·  washingtondcmagazine.com',pad+6,H-pad-22*s)};
    Promise.all([document.fonts.load('700 72px "Playfair Display"'),document.fonts.load('600 24px "Inter Tight"')]).then(function(){
      if(P.feature_image&&photoFor!==P.feature_image){photo=new Image();photo.crossOrigin='anonymous';photo.onload=function(){photoFor=P.feature_image;go()};photo.onerror=go;photo.src=img(P.feature_image,2000)}else go()})}
  document.getElementById('dl').onclick=function(){cv.toBlob(function(b){var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='wdcm-feature-'+P.slug+'-'+fmt+'.png';a.click()},'image/png')};
  document.getElementById('nshare').onclick=function(){cv.toBlob(function(b){var f=new File([b],'wdcm-feature.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],title:P.title,text:'As featured in Washington DC Magazine: '+LIVE+'/'+P.slug+'/'});else document.getElementById('dl').click()},'image/png')};
})();
