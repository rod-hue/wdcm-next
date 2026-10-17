/* WDCM NEXT: live features (scoreboard, District Daily) + the traveling gold star */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  /* ===== THE SCOREBOARD (same ESPN feeds as the live site) ===== */
  var row=document.getElementById('scRow');
  if(row){
    var E='https://site.api.espn.com/apis/site/v2/sports/';
    var TEAMS=[{name:'Commanders',path:'football/nfl/teams/wsh',q:'Washington Commanders',c:'#7a1a1a',c2:'#ffb612'},{name:'Wizards',path:'basketball/nba/teams/wsh',q:'Washington Wizards',c:'#0b3a7a',c2:'#e31837'},{name:'Capitals',path:'hockey/nhl/teams/wsh',q:'Washington Capitals',c:'#0a2a5c',c2:'#c8102e'},{name:'Nationals',path:'baseball/mlb/teams/wsh',q:'Washington Nationals',c:'#a3122a',c2:'#2a3a6e'},{name:'Mystics',path:'basketball/wnba/teams/wsh',q:'Washington Mystics',c:'#16305e',c2:'#c8102e'},{name:'D.C. United',path:'soccer/usa.1/teams/193',q:'DC United',c:'#222',c2:'#ef3e42'},{name:'Spirit',path:'soccer/usa.nwsl/teams/15365',q:'Washington Spirit',c:'#1a1a1a',c2:'#d61f3a'}];
    function j(u){return fetch(u,{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return null})}
    function sv(s){return s&&typeof s==='object'?(s.displayValue||s.value):s}
    function tix(q){return 'https://www.vividseats.com/search?searchTerm='+encodeURIComponent(q)}
    function et(d){return new Date(d).toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/New_York'})}
    function card(t,sched,sb){var team=sched&&sched.team||{},id=team.id,logo=(team.logos&&team.logos[0]&&team.logos[0].href)||team.logo||'',ev=(sched&&sched.events)||[];
      var st=function(e,s){try{return e.competitions[0].status.type.state===s}catch(_){return false}};
      var done=ev.filter(function(e){return st(e,'post')}),live=ev.filter(function(e){return st(e,'in')}),pre=ev.filter(function(e){return st(e,'pre')});
      var side=function(c){var m,o;c.competitors.forEach(function(x){String(x.team.id)===String(id)?m=x:o=x});return{m:m,o:o}};
      var body='',state='off',big='';
      var lv=live[0];if(lv&&sb&&sb.events){var se=sb.events.filter(function(e){return String(e.id)===String(lv.id)})[0];if(se)lv=se}
      if(lv){var c=lv.competitions[0],s=side(c);state='live';big=(sv(s.m.score)||'0')+'<i>&ndash;</i>'+(sv(s.o.score)||'0');body='<span class="sc-st live">Live &middot; '+esc(c.status.type.shortDetail||'')+'</span><span class="sc-vs">'+(s.o.homeAway==='home'?'at':'vs')+' '+esc(s.o.team.abbreviation)+'</span>'}
      else if(done.length){var e=done[done.length-1],c2=e.competitions[0],s2=side(c2);var w=s2.m.winner?'W':s2.o.winner?'L':'D';state=w==='W'?'win':w==='L'?'loss':'draw';big=sv(s2.m.score)+'<i>&ndash;</i>'+sv(s2.o.score);body='<span class="sc-st">'+w+' &middot; Final</span><span class="sc-vs">'+(s2.o.homeAway==='home'?'at':'vs')+' '+esc(s2.o.team.abbreviation)+'</span>'}
      else{big='&mdash;';body='<span class="sc-st">Offseason</span>'}
      var nx=pre[0],nxt=nx?(function(){var s3=side(nx.competitions[0]);return (s3.o.homeAway==='home'?'at ':'vs ')+s3.o.team.abbreviation+' &middot; '+et(nx.date)})():'Schedule coming soon';
      return '<article class="sc-card '+state+'" style="--tc:'+t.c+';--tc2:'+t.c2+'"><i class="sc-glow"></i><i class="sc-sheen"></i>'+(logo?'<img class="sc-wm" src="'+logo+'" alt="">':'')+'<div class="sc-top">'+(logo?'<img src="'+logo+'" alt="" loading="lazy">':'')+'<b>'+esc(t.name)+'</b></div><div class="sc-big">'+big+'</div>'+body+'<a class="sc-next" href="'+tix(t.q)+'" target="_blank" rel="sponsored noopener"><span>Next</span>'+nxt+' <em>Tickets &rarr;</em></a></article>'}
    function load(){Promise.all(TEAMS.map(function(t){var lg=t.path.split('/teams/')[0];return Promise.all([j(E+t.path+'/schedule'),j(E+lg+'/scoreboard')]).then(function(r){return card(t,r[0],r[1])})})).then(function(cards){
      /* live games first */
      cards.sort(function(a,b){return (b.indexOf(' live"')>-1)-(a.indexOf(' live"')>-1)});row.innerHTML=cards.join('');
      if(window.gsap&&!reduce)gsap.from(row.children,{y:40,opacity:0,duration:.9,ease:'expo.out',stagger:.06,scrollTrigger:{trigger:row,start:'top 88%',once:true}})})}
    load();setInterval(function(){if(!document.hidden&&row.querySelector('.live'))load()},60000);
  }

  /* ===== THE DISTRICT DAILY ===== */
  var gg=document.getElementById('gmGrid');
  if(gg){var GAMES=[['Crossword','A proper 7x7 with black squares','~15 min','#'],['DC Trivia','Fifteen tough questions on the District','~15 min','?'],['District Links','Sort sixteen words into four DC groups','~12 min','&#8801;'],['Sudoku','The daily nine-by-nine, starts on Hard','~25 min','9'],['Districtle','Six guesses, one six-letter word','~8 min','W'],['Word Search','Twelve DC landmarks in a 15x15 grid','~12 min','&#8981;'],['Scramble','Unjumble a long D.C. word','~8 min','&#8634;'],['2048','Slide, merge, chase the gold','~20 min','2k'],['Memory','Twelve pairs, twenty-four cards','~10 min','&#9670;'],['Minesweeper','Expert 16x16, forty mines','~20 min','&#9873;']];
    var url='https://www.washingtondcmagazine.com/games/';
    gg.innerHTML=GAMES.map(function(g,i){return '<a class="gm'+(i===0?' gm-feat':'')+'" href="'+url+'"><span class="gm-ic">'+g[3]+'</span><b>'+g[0]+'</b><span class="gm-b">'+g[1]+'</span><span class="mono gm-t">'+g[2]+' &middot; Play &rarr;</span></a>'}).join('');
    [].forEach.call(gg.children,function(a,i){a.style.setProperty('--d',(i*.05)+'s')});
    new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){gg.classList.add('in');o.disconnect()}})},{rootMargin:'0px 0px -12% 0px'}).observe(gg)}

  /* ===== THE GOLD STAR: orbits the dome in the opener, then rests ===== */
  if(reduce)return;
  var pin=document.querySelector('.dome-pin'),dcv=document.getElementById('domeCv');if(!pin||!dcv)return;
  var cv=document.createElement('canvas');cv.className='star-trail';cv.setAttribute('aria-hidden','true');pin.appendChild(cv);
  var x=cv.getContext('2d'),W=0,H=0,dpr=Math.min(2,devicePixelRatio||1),trail=[],rot=0,on=true,t0=performance.now();
  function size(){W=pin.clientWidth;H=pin.clientHeight;cv.width=W*dpr;cv.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0)}size();addEventListener('resize',size);
  new IntersectionObserver(function(es){on=es[0].isIntersecting},{rootMargin:'100px'}).observe(pin);
  function star(cx,cy,r,a){x.beginPath();for(var i=0;i<10;i++){var rr=i%2?r*.42:r,ang=a+i*Math.PI/5-Math.PI/2;x.lineTo(cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr)}x.closePath()}
  (function loop(now){requestAnimationFrame(loop);if(!on)return;
    var d=document.getElementById('dome').getBoundingClientRect(),prog=Math.max(0,Math.min(1,-d.top/Math.max(1,d.height-H)));
    var r=dcv.getBoundingClientRect(),pr=pin.getBoundingClientRect(),cx=r.left-pr.left+r.width/2,cy=r.top-pr.top+r.height*.6;
    var ang=(now-t0)/1000*.55+prog*Math.PI*4,depth=Math.sin(ang);
    var q={x:cx+Math.cos(ang)*r.width*.44,y:cy+depth*r.height*.07-r.height*.02,d:depth};
    trail.push(q);if(trail.length>26)trail.shift();rot+=.012;
    x.clearRect(0,0,W,H);
    for(var i=1;i<trail.length;i++){var a=i/trail.length,f=.35+.65*(trail[i].d*.5+.5);x.strokeStyle='rgba(233,214,160,'+(a*.45*f)+')';x.lineWidth=a*2.4*f;x.lineCap='round';x.beginPath();x.moveTo(trail[i-1].x,trail[i-1].y);x.lineTo(trail[i].x,trail[i].y);x.stroke()}
    /* behind the dome: dim and small; in front: bright */
    var s=.55+.45*(depth*.5+.5),al=depth<0?.35:1;x.globalAlpha=al;
    var g=x.createRadialGradient(q.x,q.y,0,q.x,q.y,40*s);g.addColorStop(0,'rgba(255,224,140,.5)');g.addColorStop(1,'rgba(255,224,140,0)');x.fillStyle=g;x.beginPath();x.arc(q.x,q.y,40*s,0,7);x.fill();
    var gs=x.createLinearGradient(q.x-12,q.y-12,q.x+12,q.y+12);gs.addColorStop(0,'#fff3c4');gs.addColorStop(.5,'#e3c06a');gs.addColorStop(1,'#a8822e');
    x.fillStyle=gs;star(q.x,q.y,12*s,rot);x.fill();x.strokeStyle='rgba(255,248,220,.9)';x.lineWidth=.8;x.stroke();x.globalAlpha=1})(t0);
})();
