/* WDCM theme glue: cookie consent everywhere; header, search and ticker on plain templates (pages, sections, authors, errors) */
(function(){
  /* cookie consent, same keys as the previous theme so returning readers are not asked again */
  var cb=document.getElementById('cookie-banner');
  if(cb){var done=false;try{done=localStorage.getItem('cookies_accepted')||localStorage.getItem('wdcm_cookie_consent')}catch(e){}
    cb.style.display=done?'none':'flex';
    function set(v,w){try{localStorage.setItem('cookies_accepted',v);localStorage.setItem('wdcm_cookie_consent',w)}catch(e){}cb.style.display='none'}
    var a=document.getElementById('cookie-accept'),d=document.getElementById('cookie-decline');
    if(a)a.onclick=function(){set('all','accepted')};if(d)d.onclick=function(){set('none','declined')}}


  /* The District Daily games: the games file is served as text, so it is loaded into the frame directly */
  (function(){var U='/content/files/2026/09/wdcm_games_v2.html',cache=null;
    function fix(){[].forEach.call(document.querySelectorAll('iframe'),function(f){var s=f.getAttribute('src')||'';if(s.indexOf('wdcm_games_v2.html')<0||f.srcdoc||f.dataset.wd2)return;f.dataset.wd2='1';
      var m=/embed=([a-z0-9]+)/i.exec(s),pre=m?('<scr'+'ipt>location.hash='+JSON.stringify(m[1])+';</scr'+'ipt>'):'';
      (cache||(cache=fetch(U).then(function(r){return r.text()}))).then(function(h){var n=f.cloneNode(false);n.removeAttribute('src');n.dataset.wd2='1';n.setAttribute('data-wgfix','1');n.srcdoc=pre+h;if(f.parentNode)f.parentNode.replaceChild(n,f)})})}
    fix();var k=0,iv=setInterval(function(){fix();if(++k>40)clearInterval(iv)},250)})();

  if(!document.body.classList.contains('wd-plain'))return;
  var KEY='6a3e40e14a8c49d7da3546ac98',API='/ghost/api/content/';
  function api(res,p){var u=new URL(API+res,location.origin);u.searchParams.set('key',KEY);for(var k in p)u.searchParams.set(k,p[k]);return fetch(u).then(function(r){return r.json()})}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var NAV=[['National','national-news'],['Politics','politics'],['Sports','dc-sports'],['Business','business'],['Culture','culture'],['Food & Drink','food-drink'],['DC Answers','dc-answers']];
  var nav=document.getElementById('sectionsNav');
  if(nav&&!nav.children.length)nav.innerHTML=NAV.map(function(n){var on=location.pathname.indexOf('/tag/'+n[1]+'/')===0;return '<a href="/tag/'+n[1]+'/"'+(on?' aria-current="page"':'')+'>'+n[0]+'</a>'}).join('');
  function tick(){var el=document.getElementById('sysClock');if(el)el.textContent='Washington, DC  '+new Date().toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/New_York'})}tick();setInterval(tick,30000);
  fetch('https://api.open-meteo.com/v1/forecast?latitude=38.9072&longitude=-77.0369&current=temperature_2m&temperature_unit=fahrenheit').then(function(r){return r.json()}).then(function(d){var w=document.getElementById('sysWeather');if(w)w.textContent=Math.round(d.current.temperature_2m)+'°F'}).catch(function(){});
  api('posts/',{limit:12,fields:'title,slug,published_at',filter:'tag:-dc-answers'}).then(function(d){var ps=d.posts||[];var t=ps.map(function(p){return '<a href="/'+p.slug+'/"><b>'+new Date(p.published_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/New_York'})+'</b>'+esc(p.title)+'</a>'}).join('');var tk=document.getElementById('ticker');if(tk)tk.innerHTML=t+t;var f=document.getElementById('sysFresh');if(f&&ps[0]){var m=Math.round((Date.now()-new Date(ps[0].published_at))/60000);f.textContent='Updated '+(m<60?m+' min ago':Math.round(m/60)+' hr ago')}});
  var mast=document.getElementById('mast');if(mast)addEventListener('scroll',function(){mast.classList.toggle('slim',scrollY>120)},{passive:true});
  var sr=document.getElementById('search'),q=document.getElementById('q'),qr=document.getElementById('qres'),sb=document.getElementById('searchBtn'),tm;
  if(sr&&q&&sb){sb.addEventListener('click',function(){sr.hidden=false;setTimeout(function(){q.focus()},30)});
    addEventListener('keydown',function(e){if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();sr.hidden=false;q.focus()}if(e.key==='Escape')sr.hidden=true});
    sr.addEventListener('click',function(e){if(e.target===sr)sr.hidden=true});
    q.addEventListener('input',function(){clearTimeout(tm);var v=q.value.trim().replace(/'/g,'');if(v.length<2){qr.innerHTML='';return}
      tm=setTimeout(function(){api('posts/',{limit:12,filter:"title:~'"+v+"'",fields:'title,slug,published_at'}).then(function(d){qr.innerHTML=(d.posts||[]).map(function(p){return '<li><a href="/'+p.slug+'/">'+esc(p.title)+'</a></li>'}).join('')||'<li class="mono muted">No stories yet</li>'})},220)})}
})();
