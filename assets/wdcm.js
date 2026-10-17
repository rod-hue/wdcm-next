/* WDCM NEXT: live front end on the Ghost Content API */
(function(){
  var API='https://www.washingtondcmagazine.com/ghost/api/content/', KEY='6a3e40e14a8c49d7da3546ac98';
  var LIVE='https://www.washingtondcmagazine.com';
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROOMS=[
    {t:'National',k:'Washington\u2019s view of America',f:'tag:national-news',slug:'national-news',lay:'reel',film:'national'},
    {t:'Politics & Power',k:'The Council, the Mayor, Congress and the vote',f:'tag:[dc-politics,d-c-council,mayor-and-agencies,elections-and-accountability,politics]',slug:'politics',lay:'docket',film:'capitol'},
    {t:'Sports',k:'From the District to the national stage',f:'tag:[dc-sports,sports,national-sports]',slug:'dc-sports',lay:'arena',film:'sports'},
    {t:'Business',k:'Money, power and the American economy',f:'tag:business',slug:'business',lay:'index',film:'business'},
    {t:'Culture',k:'Music, film and the national conversation',f:'tag:[pop-culture,culture,music,arts-culture]',slug:'culture',lay:'gallery',film:'culture'},
    {t:'Food & Drink',k:'Where the capital eats now',f:'tag:food-drink',slug:'food-drink',lay:'menu',film:'food'}
  ];
  var NAV=[['National','national-news'],['Politics','politics'],['Sports','dc-sports'],['Business','business'],['Culture','culture'],['Food & Drink','food-drink'],['DC Answers','dc-answers']];

  function api(res,params){var u=new URL(API+res+'/');u.searchParams.set('key',KEY);for(var k in params)u.searchParams.set(k,params[k]);return fetch(u).then(function(r){return r.json()})}
  function img(u,w){if(!u)return '';if(u.indexOf('/content/images/')>-1&&u.indexOf('/size/')<0)return u.replace('/content/images/','/content/images/size/w'+w+'/');return u}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function ago(d){var s=(Date.now()-new Date(d))/1000;if(s<60)return 'Just now';if(s<3600)return Math.floor(s/60)+' min ago';if(s<86400)return Math.floor(s/3600)+' hr ago';var n=Math.floor(s/86400);return n===1?'Yesterday':n+' days ago'}
  function clock(d){return new Date(d).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/New_York'})}
  function link(p){return 'article.html?s='+encodeURIComponent(p.slug)}
  function sec(p){return p.primary_tag?p.primary_tag.name:'News'}
  function isNew(p){return Date.now()-new Date(p.published_at)<6*3600e3}
  function card(p,w){return '<a class="card'+(isNew(p)?' new':'')+'" href="'+link(p)+'"><div class="ph">'+(p.feature_image?'<img loading="lazy" src="'+img(p.feature_image,w||800)+'" alt="">':'')+'</div><div class="tx"><span class="sec">'+esc(sec(p))+'</span><h3>'+esc(p.title)+'</h3><span class="ago">'+ago(p.published_at)+' &middot; '+(p.reading_time||1)+' min read</span></div></a>'}
  var FIELDS='id,title,slug,published_at,feature_image,custom_excerpt,excerpt,reading_time,primary_tag';

  /* nav */
  var nav=document.getElementById('sectionsNav');
  if(nav)nav.innerHTML=NAV.map(function(n){return '<a href="#room-'+n[1]+'">'+n[0]+'</a>'}).join('');

  /* clock + weather */
  function tick(){var el=document.getElementById('sysClock');if(el)el.textContent='Washington, DC  '+new Date().toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/New_York'})}
  tick();setInterval(tick,15000);
  fetch('https://api.open-meteo.com/v1/forecast?latitude=38.9072&longitude=-77.0369&current=temperature_2m,weather_code&temperature_unit=fahrenheit').then(function(r){return r.json()}).then(function(d){var c=d.current;var w={0:'Clear',1:'Mostly clear',2:'Partly cloudy',3:'Cloudy',45:'Fog',48:'Fog',51:'Drizzle',53:'Drizzle',55:'Drizzle',61:'Rain',63:'Rain',65:'Heavy rain',71:'Snow',73:'Snow',75:'Snow',80:'Showers',81:'Showers',82:'Storms',95:'Thunderstorms'}[c.weather_code]||'';document.getElementById('sysWeather').textContent=Math.round(c.temperature_2m)+'°F '+w}).catch(function(){});

  /* main load */
  var newest=null,seen={};
  api('posts',{limit:24,include:'tags,authors',fields:FIELDS,filter:'tag:-dc-answers'}).then(function(d){
    var ps=d.posts;ps.forEach(function(p){seen[p.id]=1});newest=ps[0]&&ps[0].published_at;
    var withImg=ps.filter(function(p){return p.feature_image});
    renderLead(withImg[0]);
    renderWire(ps.slice(0,14));
    var rest=withImg.filter(function(p){return p!==withImg[0]}).slice(0,6);
    var rn=document.getElementById('rightNow');rn.className='bento';
    rn.innerHTML=rest.map(function(p,i){return '<a class="bt bt'+i+'" href="'+link(p)+'" style="--d:'+(i*.08)+'s"><div class="bt-ph"><img src="'+img(p.feature_image,i?900:1600)+'" alt=""></div><span class="bt-n">0'+(i+1)+'</span><i class="bt-edge"></i><div class="bt-tx"><span class="sec">'+esc(sec(p))+'</span><h3>'+esc(p.title)+'</h3><span class="ago"><i class="live-dot"></i>'+ago(p.published_at)+'</span></div></a>'}).join('');
    new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){rn.classList.add('in');o.disconnect()}})},{rootMargin:'0px 0px -10% 0px'}).observe(rn);
    var today=ps.filter(function(p){return Date.now()-new Date(p.published_at)<86400e3}).length;
    document.getElementById('todayCount').textContent=today+' new stories in the last 24 hours';
    renderTicker(ps.slice(0,12));fresh();reveal();
  });

  function renderLead(p){if(!p)return;var el=document.getElementById('lead');var brk=(p.tags||[]).some(function(t){return t.slug==='breaking'});
    var words=esc(p.title).split(' ').map(function(w){return '<span class="w"><span>'+w+'</span></span>'}).join(' ');
    var au=(p.authors||[])[0];
    el.innerHTML='<div class="bg"><img src="'+img(p.feature_image,2000)+'" alt=""></div><div class="copy"><span class="tagpill'+(brk?' breaking':'')+'">'+(brk?'Breaking':esc(sec(p)))+'</span><h1>'+words+'</h1><p class="dek">'+esc(p.custom_excerpt||p.excerpt||'').slice(0,220)+'</p><div class="meta"><span>'+(au?esc(au.name):'WDCM')+'</span><i class="dot"></i><span>'+ago(p.published_at)+'</span><i class="dot"></i><span>'+(p.reading_time||1)+' min read</span></div></div><a class="cover" href="'+link(p)+'" aria-label="'+esc(p.title)+'"></a>';
    if(window.gsap&&!reduce)gsap.from(el.querySelectorAll('h1 .w>span'),{yPercent:110,duration:1.1,ease:'expo.out',stagger:.04,delay:.15});
  }
  function wireItem(p,f){return '<li'+(f?' class="fresh"':'')+'><a href="'+link(p)+'"><span class="t">'+clock(p.published_at)+'</span><span><span class="h">'+esc(p.title)+'</span><span class="s">'+esc(sec(p))+' &middot; '+ago(p.published_at)+'</span></span></a></li>'}
  function renderWire(ps){document.getElementById('wire').innerHTML=ps.map(function(p){return wireItem(p)}).join('')}
  function renderTicker(ps){var t=ps.map(function(p){return '<a href="'+link(p)+'"><b>'+clock(p.published_at)+'</b>'+esc(p.title)+'</a>'}).join('');document.getElementById('ticker').innerHTML=t+t}
  function fresh(){var el=document.getElementById('sysFresh');if(!el||!newest)return;el.textContent='Updated '+ago(newest).toLowerCase()}
  setInterval(fresh,30000);

  /* live polling: new stories slide into The Signal */
  var pending=0,baseTitle=document.title;
  setInterval(function(){if(!newest||document.hidden)return;
    api('posts',{limit:10,include:'tags,authors',fields:FIELDS,filter:"published_at:>'"+newest+"'+tag:-dc-answers"}).then(function(d){var ps=(d.posts||[]).filter(function(p){return !seen[p.id]});if(!ps.length)return;
      ps.forEach(function(p){seen[p.id]=1});newest=ps[0].published_at;var w=document.getElementById('wire');
      w.insertAdjacentHTML('afterbegin',ps.map(function(p){return wireItem(p,true)}).join(''));
      pending+=ps.length;document.title='('+pending+') '+baseTitle;var pill=document.getElementById('newPill');document.getElementById('newCount').textContent=pending;pill.hidden=false;fresh()})
  },60000);
  document.getElementById('newPill').addEventListener('click',function(){document.getElementById('wire').scrollTo({top:0,behavior:'smooth'});pending=0;document.title=baseTitle;this.hidden=true});

  /* pulse: trending topics from the last 100 stories */
  Promise.all([1,2].map(function(pg){return api('posts',{limit:100,page:pg,include:'tags',fields:'id,published_at'})})).then(function(rs){var d={posts:rs[0].posts.concat(rs[1].posts||[])};var c={},names={};
    var skip='breaking top-stories news featured editors-pick evergreen sponsored power-moves politics dc-politics sports dc-sports national-sports culture dc-culture pop-culture lifestyle national-news dc-news national business dc-answers opinion music events arts-culture arts food-drink entertainment dc-lifestyle'.split(' ').reduce(function(o,k){o[k]=1;return o},{});
    (d.posts||[]).forEach(function(p){(p.tags||[]).forEach(function(t){if(t.visibility!=='public'||skip[t.slug]||/^evdate-/.test(t.slug))return;c[t.slug]=(c[t.slug]||0)+1;names[t.slug]=t.name})});
    var top=Object.keys(c).sort(function(a,b){return c[b]-c[a]}).slice(0,22);var mx=c[top[0]]||1;
    top.sort(function(){return Math.random()-.5});
    document.getElementById('pulse').innerHTML=top.map(function(s){var r=c[s]/mx;return '<a href="'+LIVE+'/tag/'+s+'/" style="font-size:'+(18+r*58).toFixed(0)+'px;opacity:'+(.55+r*.45).toFixed(2)+'">'+esc(names[s])+'<sup>'+c[s]+'</sup></a>'}).join('');reveal();
  });


  /* each channel gets its own crafted layout */
  function ex(q,n){var t=(q.custom_excerpt||q.excerpt||'').replace(/\s+/g,' ').trim();n=n||140;if(t.length>n)t=t.slice(0,t.lastIndexOf(' ',n))+'\u2026';return esc(t)}
  var LAY={
    /* POLITICS: The Docket, a front-page banner and four filed columns */
    docket:function(s,ps){var st=s.querySelector('.ch-stage');st.className='ch-stage pl';var p=ps[0];
      st.innerHTML='<a class="pl-lead rv" href="'+link(p)+'"><div class="pl-ph"><img src="'+img(p.feature_image,2000)+'" alt=""></div><div class="pl-seal"><span>The</span><b>Docket</b><span>No. '+String(new Date().getDate()).padStart(2,'0')+'</span></div><div class="pl-tx"><span class="pl-kick mono"><i class="live-dot"></i> Top of the docket</span><h3>'+esc(p.title)+'</h3><p>'+ex(p,200)+'</p><span class="ago">'+ago(p.published_at)+' &middot; '+(p.reading_time||1)+' min read</span></div></a>'+
        '<div class="pl-cols">'+ps.slice(1,5).map(function(q,i){return '<a class="pl-col rv" href="'+link(q)+'"><span class="pl-no mono">Item '+String(i+2).padStart(2,'0')+'</span><div class="pl-thumb"><img src="'+img(q.feature_image,700)+'" alt="" loading="lazy"></div><span class="sec">'+esc(sec(q))+'</span><h4>'+esc(q.title)+'</h4><span class="ago">'+ago(q.published_at)+'</span></a>'}).join('')+'</div>'},
    /* SPORTS: the Jumbotron, a stadium screen with a broadcast chyron, a live bottom line and a highlight reel */
    arena:function(s,ps){var st=s.querySelector('.ch-stage');st.className='ch-stage jt-wrap';
      var slides=ps.map(function(q,i){return '<a class="jt-slide'+(i?'':' on')+'" href="'+link(q)+'"><img src="'+img(q.feature_image,1800)+'" alt=""'+(i?' loading="lazy"':'')+'><div class="jt-chy"><span class="jt-kick mono">'+(i?esc(sec(q)):'Game of the day')+'</span><h3>'+esc(q.title)+'</h3><span class="jt-meta mono">'+ago(q.published_at)+' &middot; '+(q.reading_time||1)+' min read</span></div></a>'}).join('');
      var reel=ps.map(function(q,i){return '<a class="fs-frame" href="'+link(q)+'" data-i="'+i+'"><img src="'+img(q.feature_image,500)+'" alt="" loading="lazy"><span class="fs-cap"><b class="mono">Clip '+String(i+1).padStart(2,'0')+'</b>'+esc(q.title)+'</span></a>'}).join('');
      st.innerHTML='<div class="jt"><div class="jt-truss" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>'+
        '<div class="jt-screen">'+slides+'<div class="jt-led" aria-hidden="true"></div><div class="jt-scan" aria-hidden="true"></div>'+
        '<span class="jt-bug mono"><i class="live-dot"></i> WDCM Sports</span><span class="jt-clock mono" aria-hidden="true"></span>'+
        '<div class="jt-bl"><b class="mono">The Bottom Line</b><div class="jt-tick"><div class="jt-tt"></div></div></div></div>'+
        '<div class="jt-base" aria-hidden="true"></div></div>'+
        '<div class="fs"><div class="fs-head mono"><span>Highlight reel</span><span>Hover a clip to put it on the big screen</span></div><div class="fs-strip"><div class="fs-track">'+reel+reel+'</div></div></div>';
      var sl=[].slice.call(st.querySelectorAll('.jt-slide')),scr=st.querySelector('.jt-screen'),cur=0,hold=false,vis=false;
      function show(i){i=(i+sl.length)%sl.length;if(i===cur)return;scr.classList.remove('sw');void scr.offsetWidth;scr.classList.add('sw');sl[cur].classList.remove('on');cur=i;sl[cur].classList.add('on')}
      st.querySelectorAll('.fs-frame').forEach(function(f){f.addEventListener('mouseenter',function(){hold=true;show(+f.dataset.i)});f.addEventListener('mouseleave',function(){hold=false})});
      scr.addEventListener('mouseenter',function(){hold=true});scr.addEventListener('mouseleave',function(){hold=false});
      new IntersectionObserver(function(es){vis=es[0].isIntersecting},{threshold:.25}).observe(scr);
      if(!reduce)setInterval(function(){if(vis&&!hold&&!document.hidden)show(cur+1)},4500);
      var ck=st.querySelector('.jt-clock');function clk(){ck.textContent=new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/New_York'})+' ET'}clk();setInterval(clk,30000);
      /* bottom line: live Washington scores from the scoreboard, then the sports wire */
      var tt=st.querySelector('.jt-tt');function tick(){var sc=[].slice.call(document.querySelectorAll('#scRow .sc-card:not(.sk)')).map(function(c){var n=c.querySelector('.sc-top b'),b=c.querySelector('.sc-big'),stt=c.querySelector('.sc-st');return n&&b&&b.textContent.trim()!=='—'?'<span><b>'+esc(n.textContent).toUpperCase()+'</b> '+esc(b.textContent)+' <em>'+esc(stt?stt.textContent:'')+'</em></span>':''}).filter(Boolean);
        var hd=ps.map(function(q){return '<span>'+esc(q.title)+'</span>'});var all=sc.concat(hd).join('<i>&#9670;</i>')+'<i>&#9670;</i>';tt.innerHTML=all+all}
      tick();setTimeout(tick,4000);setInterval(tick,60000)},
    /* BUSINESS: the index, a ledger of big headlines with a floating preview */
    index:function(s,ps){var st=s.querySelector('.ch-stage');st.className='ch-stage bz';
      st.innerHTML='<div class="bz-hd mono"><span>No.</span><span>Story</span><span>Filed</span></div>'+ps.map(function(q,i){return '<a class="bz-row rv" href="'+link(q)+'" data-img="'+img(q.feature_image,900)+'"><span class="bz-n">'+String(i+1).padStart(2,'0')+'</span><span class="bz-t"><img class="bz-mthumb" src="'+img(q.feature_image,300)+'" alt="" loading="lazy"><span><span class="sec">'+esc(sec(q))+'</span><h4>'+esc(q.title)+'</h4></span></span><span class="bz-f mono">'+ago(q.published_at)+'<i>&rarr;</i></span></a>'}).join('')+'<div class="bz-float" aria-hidden="true"><img alt=""></div>';
      var fl=st.querySelector('.bz-float'),fi=fl.querySelector('img'),fx=0,fy=0,tx=0,ty=0,on=false;
      st.querySelectorAll('.bz-row').forEach(function(r){r.addEventListener('mouseenter',function(){fi.src=r.dataset.img;on=true;fl.classList.add('on')});r.addEventListener('mouseleave',function(){on=false;fl.classList.remove('on')})});
      st.addEventListener('mousemove',function(e){var b=st.getBoundingClientRect();tx=e.clientX-b.left;ty=e.clientY-b.top});
      (function mv(){requestAnimationFrame(mv);if(!on&&!fl.classList.contains('on'))return;fx+=(tx-fx)*.14;fy+=(ty-fy)*.14;fl.style.transform='translate('+fx+'px,'+fy+'px) translate(-50%,-50%) rotate('+((tx-fx)*.03)+'deg)'})()},
    /* CULTURE: the gallery wall, framed pieces with museum labels, drifting at different speeds */
    gallery:function(s,ps){var st=s.querySelector('.ch-stage');st.className='ch-stage gl';
      st.innerHTML=ps.slice(0,6).map(function(q,i){return '<a class="gl-piece rv g'+i+'" href="'+link(q)+'" data-speed="'+[.0,-.12,.08,-.06,.14,-.1][i]+'"><div class="gl-frame"><img src="'+img(q.feature_image,i?900:1500)+'" alt="" loading="lazy"></div><div class="gl-label"><span class="mono">'+esc(sec(q))+' &middot; '+ago(q.published_at)+'</span><h4>'+esc(q.title)+'</h4></div></a>'}).join('')},
    /* FOOD & DRINK: tonight's menu, a printed card with plated stories */
    menu:function(s,ps){var st=s.querySelector('.ch-stage');st.className='ch-stage mn';var d=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
      st.innerHTML='<div class="mn-card rv"><div class="mn-top"><span class="mono">'+esc(d)+'</span><h3>Tonight&rsquo;s <em>Menu</em></h3><span class="mn-orn">&#10022; &#10022; &#10022;</span></div><div class="mn-items">'+ps.slice(0,6).map(function(q,i){return '<a class="mn-item" href="'+link(q)+'"><span class="mn-plate"><img src="'+img(q.feature_image,400)+'" alt="" loading="lazy"></span><span class="mn-body"><span class="mn-line"><h4>'+esc(q.title)+'</h4><i></i><b>'+(q.reading_time||1)+' min</b></span><span class="mn-desc">'+ex(q,110)+'</span></span></a>'}).join('')+'</div><div class="mn-foot mono">Served fresh daily by the WDCM kitchen</div></div>'}
  };
  /* rooms: cinematic channels */
  var rooms=document.getElementById('rooms');
  ROOMS.forEach(function(r,ri){var s=document.createElement('section');s.className='room ch lay-'+r.lay;s.id='room-'+r.slug;
    s.innerHTML='<div class="ch-bg"><video muted loop playsinline preload="none" poster="assets/film/'+r.film+'.jpg" data-q="assets/film/'+r.film+'"></video></div>'+
      '<div class="ch-giant" aria-hidden="true">'+esc(r.t.replace(' & ',' & '))+'</div>'+
      '<div class="ch-in"><header class="ch-head"><span class="mono gold-txt">'+String(ri+1).padStart(2,'0')+' / Channel</span><h2>'+esc(r.t).replace('&amp;','<em>&amp;</em>')+'</h2><p>'+esc(r.k)+'</p><a class="ch-all mono" href="'+LIVE+'/tag/'+r.slug+'/">All '+esc(r.t)+' <span>&rarr;</span></a></header>'+
      '<div class="ch-stage"><div class="ch-lead-wrap"></div><div class="ch-list"></div></div></div>';rooms.appendChild(s);
    api('posts',{limit:r.lay==='reel'?5:7,filter:r.f+'+feature_image:-null+tag:-dc-answers',fields:FIELDS,include:'tags'}).then(function(d){var ps=d.posts||[];if(!ps.length)return;var p=ps[0];
      if(r.lay!=='reel'){LAY[r.lay](s,ps);document.dispatchEvent(new CustomEvent('wdcm:room',{detail:s}));return}
      s.querySelector('.ch-lead-wrap').innerHTML='<div class="ch-lead"><i class="pg pg2"></i><i class="pg pg1"></i><div class="ch-card">'+ps.map(function(q,i){return '<a class="ch-slide'+(i?'':' on')+'" href="'+link(q)+'"><div class="ch-ph"><img src="'+img(q.feature_image,1400)+'" alt=""'+(i?' loading="lazy"':'')+'></div><div class="ch-tx"><span class="tagpill">'+esc(sec(q))+'</span><h3>'+esc(q.title)+'</h3><span class="ago">'+ago(q.published_at)+' &middot; '+(q.reading_time||1)+' min read</span></div></a>'}).join('')+'<div class="ch-prog">'+ps.map(function(){return '<i><b></b></i>'}).join('')+'</div></div></div>';
      s.querySelector('.ch-list').innerHTML=ps.map(function(q,i){return '<a class="ch-item'+(i?'':' on')+'" href="'+link(q)+'" style="--i:'+i+'" data-i="'+i+'"><span class="ci-n mono">0'+(i+1)+'</span><div class="ci-ph"><img src="'+img(q.feature_image,500)+'" alt=""></div><div><span class="sec">'+esc(sec(q))+'</span><h4>'+esc(q.title)+'</h4><span class="ago">'+ago(q.published_at)+'</span></div></a>'}).join('');
      (function(){var sl=[].slice.call(s.querySelectorAll('.ch-slide')),it=[].slice.call(s.querySelectorAll('.ch-item')),pr=[].slice.call(s.querySelectorAll('.ch-prog i')),cur=0,vis=false,hold=false,T=3000,t=0,last=0;
        function show(i){cur=(i+sl.length)%sl.length;sl.forEach(function(e,k){e.classList.toggle('on',k===cur)});it.forEach(function(e,k){e.classList.toggle('on',k===cur)});pr.forEach(function(e,k){e.classList.toggle('done',k<cur);e.firstChild.style.transform='scaleX('+(k<cur?1:0)+')'});t=0}
        it.forEach(function(e,k){e.addEventListener('mouseenter',function(){show(k);hold=true});e.addEventListener('mouseleave',function(){hold=false})});
        s.querySelector('.ch-lead').addEventListener('mouseenter',function(){hold=true});s.querySelector('.ch-lead').addEventListener('mouseleave',function(){hold=false});
        new IntersectionObserver(function(es){vis=es[0].isIntersecting},{threshold:.3}).observe(s);
        (function tick(now){requestAnimationFrame(tick);var dt=last?now-last:0;last=now;if(!vis||hold||reduce)return;t+=dt;var b=pr[cur]&&pr[cur].firstChild;if(b)b.style.transform='scaleX('+Math.min(1,t/T)+')';if(t>=T)show(cur+1)})(0)})();
      document.dispatchEvent(new CustomEvent('wdcm:room',{detail:s}))});
  });
  var dca=document.getElementById('room-dc-answers');if(!dca){var a=document.querySelector('.answers');if(a)a.id='room-dc-answers'}

  /* answers: the question desk */
  api('posts',{limit:8,filter:'tag:dc-answers',fields:'title,slug,published_at,custom_excerpt,excerpt,reading_time'}).then(function(d){var ps=d.posts||[];var el=document.getElementById('answers');if(!el)return;
    el.innerHTML=ps.map(function(p,i){return '<a class="ans" href="'+link(p)+'"><span class="ans-b"><h3>'+esc(p.title)+'</h3><span class="ans-a"><span>'+esc((p.custom_excerpt||p.excerpt||'').replace(/\s+/g,' ').slice(0,170))+'&hellip;</span><b class="mono">Read the answer &rarr;</b></span></span><i class="ans-x" aria-hidden="true">+</i></a>'}).join('');
    var mq=document.getElementById('ansMq');if(mq){var t=ps.map(function(p){return '<span>'+esc(p.title)+'</span><i>?</i>'}).join('');mq.innerHTML='<div class="amq-t">'+t+t+'</div>'}
    var cnt=document.getElementById('ansCount');if(cnt)cnt.textContent=ps.length+' fresh answers';
    new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){el.classList.add('in');o.disconnect()}})}).observe(el)});

  /* voices: contributor slider */
  Promise.all([api('authors',{limit:'all',include:'count.posts'}),api('posts',{limit:60,fields:'title,slug,published_at',include:'authors'})]).then(function(r){
    var latest={};((r[1]&&r[1].posts)||[]).forEach(function(p){(p.authors||[]).forEach(function(a){if(!latest[a.id])latest[a.id]=p})});
    var as=((r[0]&&r[0].authors)||[]).filter(function(a){return a.count&&a.count.posts>0}).sort(function(a,b){var ra=/rodriquez|rod wright/i.test(a.name)?1:0,rb=/rodriquez|rod wright/i.test(b.name)?1:0;return rb-ra||(b.profile_image?1:0)-(a.profile_image?1:0)||b.count.posts-a.count.posts}).slice(0,12);
    var el=document.getElementById('authors');if(!el)return;
    el.innerHTML='<div class="vs-track">'+as.map(function(a,i){var lp=latest[a.id];return '<a class="vs-card" href="'+LIVE+'/author/'+a.slug+'/" style="--d:'+(i*.06)+'s"><div class="vs-ph">'+(a.profile_image?'<img loading="lazy" src="'+img(a.profile_image,600)+'" alt="">':'<span class="vs-mono">'+esc(a.name.split(' ').map(function(w){return w.charAt(0)}).join('').slice(0,2))+'</span>')+'</div><div class="vs-tx"><span class="mono">'+a.count.posts+' stories</span><b>'+esc(a.name)+'</b>'+(lp?'<span class="vs-last">Latest: '+esc(lp.title)+'</span>':'')+'</div></a>'}).join('')+
      '<a class="vs-card vs-you" href="'+LIVE+'/contact/"><div class="vs-ph"><span class="vs-mono">+</span></div><div class="vs-tx"><span class="mono">Open call</span><b>Your story belongs here.</b><span class="vs-last">Pitch the editors &rarr;</span></div></a></div>';
    var tr=el.querySelector('.vs-track'),cards=[].slice.call(tr.children),idx=0;
    function go(n){var w=cards[0].offsetWidth+18,max=Math.max(0,tr.scrollWidth-el.clientWidth),last=Math.ceil(max/w);idx=Math.max(0,Math.min(last,n));tr.style.transform='translateX('+(-Math.min(idx*w,max))+'px)';
      var pv=document.getElementById('vsPrev'),nx=document.getElementById('vsNext');if(pv)pv.disabled=idx===0;if(nx)nx.disabled=idx>=last}
    var prev=document.getElementById('vsPrev'),next=document.getElementById('vsNext');
    if(prev)prev.onclick=function(){go(idx-1)};if(next)next.onclick=function(){go(idx+1)};
    var sx=0;el.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});el.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx;if(dx<-40)go(idx+1);else if(dx>40)go(idx-1)});
    addEventListener('resize',function(){go(idx)});go(0);
    new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){el.classList.add('in');o.disconnect()}})}).observe(el)});

  /* search */
  var sr=document.getElementById('search'),q=document.getElementById('q'),qr=document.getElementById('qres'),tm;
  function openS(){sr.hidden=false;setTimeout(function(){q.focus()},30)}
  function closeS(){sr.hidden=true}
  document.getElementById('searchBtn').addEventListener('click',openS);
  addEventListener('keydown',function(e){if(e.key==='/'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();openS()}if(e.key==='Escape')closeS()});
  sr.addEventListener('click',function(e){if(e.target===sr)closeS()});
  q.addEventListener('input',function(){clearTimeout(tm);var v=q.value.trim().replace(/'/g,'');if(v.length<2){qr.innerHTML='';return}
    tm=setTimeout(function(){api('posts',{limit:12,filter:"title:~'"+v+"'",fields:'title,slug,published_at,primary_tag',include:'tags'}).then(function(d){qr.innerHTML=(d.posts||[]).map(function(p){return '<li><a href="'+link(p)+'"><small>'+esc(sec(p))+' &middot; '+ago(p.published_at)+'</small>'+esc(p.title)+'</a></li>'}).join('')||'<li class="mono muted">No stories yet</li>'})},220)});

  /* masthead slim + reveals */
  var mast=document.getElementById('mast');addEventListener('scroll',function(){mast.classList.toggle('slim',scrollY>120)},{passive:true});
  var revealed=new WeakSet();
  function reveal(){if(!window.gsap||reduce)return;gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.card,.pulse-cloud a').forEach(function(el,i){if(revealed.has(el))return;revealed.add(el);
      gsap.from(el,{y:28,opacity:0,duration:.9,ease:'power3.out',delay:(i%4)*.05,scrollTrigger:{trigger:el,start:'top 92%',once:true}})});ScrollTrigger.refresh()}
  document.getElementById('yr').textContent=new Date().getFullYear();
})();
