/* WDCM NEXT: live features (scoreboard, District Daily) + the traveling gold star */
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  /* ===== THE SCOREBOARD (same ESPN feeds as the live site) ===== */
  var row=document.getElementById('scRow');
  if(row){
    var E='https://site.api.espn.com/apis/site/v2/sports/';
    var TEAMS=[{name:'Commanders',path:'football/nfl/teams/wsh',q:'Washington Commanders'},{name:'Wizards',path:'basketball/nba/teams/wsh',q:'Washington Wizards'},{name:'Capitals',path:'hockey/nhl/teams/wsh',q:'Washington Capitals'},{name:'Nationals',path:'baseball/mlb/teams/wsh',q:'Washington Nationals'},{name:'Mystics',path:'basketball/wnba/teams/wsh',q:'Washington Mystics'},{name:'D.C. United',path:'soccer/usa.1/teams/193',q:'DC United'},{name:'Spirit',path:'soccer/usa.nwsl/teams/15365',q:'Washington Spirit'}];
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
      return '<article class="sc-card '+state+'"><div class="sc-top">'+(logo?'<img src="'+logo+'" alt="" loading="lazy">':'')+'<b>'+esc(t.name)+'</b></div><div class="sc-big">'+big+'</div>'+body+'<a class="sc-next" href="'+tix(t.q)+'" target="_blank" rel="sponsored noopener"><span>Next</span>'+nxt+' <em>Tickets &rarr;</em></a></article>'}
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
    if(window.gsap&&!reduce)gsap.from(gg.children,{y:50,opacity:0,rotateX:-20,transformPerspective:900,duration:1,ease:'expo.out',stagger:.05,scrollTrigger:{trigger:gg,start:'top 85%',once:true}})}

  /* ===== THE GOLD STAR: travels the length of the site as you scroll ===== */
  if(reduce)return;
  var cv=document.createElement('canvas');cv.className='star-trail';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);
  var x=cv.getContext('2d'),W=0,H=0,dpr=Math.min(2,devicePixelRatio||1),trail=[],last=0,vel=0,rot=0,sparks=[];
  function size(){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0)}size();addEventListener('resize',size);
  function star(cx,cy,r,a){x.beginPath();for(var i=0;i<10;i++){var rr=i%2?r*.42:r,ang=a+i*Math.PI/5-Math.PI/2;x.lineTo(cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr)}x.closePath()}
  function pos(p){var mob=W<760;return{x:W*(.5+(mob?.36:.42)*Math.sin(p*Math.PI*9)),y:H*(.22+.5*(.5+.5*Math.sin(p*Math.PI*5.3+1)))}}
  (function loop(){requestAnimationFrame(loop);var max=document.documentElement.scrollHeight-H,p=max>0?scrollY/max:0;vel+=((scrollY-last)-vel)*.2;last=scrollY;
    var q=pos(p);trail.push(q);if(trail.length>48)trail.shift();rot+=.01+Math.abs(vel)*.004;
    if(Math.abs(vel)>2&&Math.random()<.7)sparks.push({x:q.x,y:q.y,vx:(Math.random()-.5)*1.6,vy:(Math.random()-.5)*1.6-.4,l:1});
    x.clearRect(0,0,W,H);
    /* trail */
    for(var i=1;i<trail.length;i++){var a=i/trail.length;x.strokeStyle='rgba(233,214,160,'+(a*.55)+')';x.lineWidth=a*3.2;x.lineCap='round';x.beginPath();x.moveTo(trail[i-1].x,trail[i-1].y);x.lineTo(trail[i].x,trail[i].y);x.stroke()}
    /* sparks */
    sparks=sparks.filter(function(s){s.x+=s.vx;s.y+=s.vy;s.l-=.025;if(s.l<=0)return false;x.fillStyle='rgba(255,226,150,'+s.l+')';x.beginPath();x.arc(s.x,s.y,1.6*s.l+.3,0,7);x.fill();return true});
    /* glow + star */
    var g=x.createRadialGradient(q.x,q.y,0,q.x,q.y,46);g.addColorStop(0,'rgba(255,224,140,.55)');g.addColorStop(1,'rgba(255,224,140,0)');x.fillStyle=g;x.beginPath();x.arc(q.x,q.y,46,0,7);x.fill();
    var gs=x.createLinearGradient(q.x-14,q.y-14,q.x+14,q.y+14);gs.addColorStop(0,'#fff3c4');gs.addColorStop(.5,'#e3c06a');gs.addColorStop(1,'#a8822e');
    x.fillStyle=gs;star(q.x,q.y,13,rot);x.fill();x.strokeStyle='rgba(255,248,220,.9)';x.lineWidth=.8;x.stroke()})();
})();
