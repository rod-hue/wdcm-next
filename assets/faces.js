/* WDCM NEXT: face-aware framing. Every cropped photo is analysed (skin + detail, via smartcrop)
   and repositioned so faces and subjects stay inside their box, at any size, on any device. */
(function(){
  var SC='https://cdnjs.cloudflare.com/ajax/libs/smartcrop/2.0.5/smartcrop.min.js',lib=null,queue=[],busy=false,cache={},seen=new WeakSet();
  function need(cb){if(window.smartcrop)return cb();if(lib)return lib.push(cb);lib=[cb];var s=document.createElement('script');s.src=SC;s.onload=function(){lib.forEach(function(f){f()})};document.head.appendChild(s)}
  function small(u){return /\/content\/images\//.test(u)?u.replace(/\/content\/images\/(size\/w\d+\/)?/,'/content/images/size/w400/'):u}
  function covers(img){var cs=getComputedStyle(img);return cs.objectFit==='cover'}
  function fit(img){var b=img.getBoundingClientRect(),w=Math.round(b.width),h=Math.round(b.height),src=img.currentSrc||img.src;
    if(!src||w<40||h<40||/\.svg|data:/.test(src))return Promise.resolve();
    var key=small(src)+'|'+(w/h).toFixed(2);
    var done=function(pos){if(pos)img.style.objectPosition=pos;img.dataset.fx='1'};
    if(cache[key])return Promise.resolve(done(cache[key]));
    return new Promise(function(res){var an=new Image();an.crossOrigin='anonymous';an.onerror=function(){res()};
      an.onload=function(){try{var W=an.naturalWidth,H=an.naturalHeight;
          smartcrop.crop(an,{width:w,height:h,minScale:1,ruleOfThirds:false,skinWeight:2.6,detailWeight:.12,saturationWeight:.04}).then(function(r){var c=r.topCrop;
            var px=W-c.width>2?c.x/(W-c.width)*100:50,py=H-c.height>2?c.y/(H-c.height)*100:50;
            py=Math.min(55,py*.55+30*.45);var pos=px.toFixed(1)+'% '+py.toFixed(1)+'%';cache[key]=pos;done(pos);res()}).catch(function(){res()})}catch(e){res()}};
      an.src=small(src)})}
  function pump(){if(busy||!queue.length)return;busy=true;var img=queue.shift();
    (img.complete&&img.naturalWidth?Promise.resolve():new Promise(function(r){img.addEventListener('load',r,{once:true});img.addEventListener('error',r,{once:true})}))
      .then(function(){return covers(img)?fit(img):null}).then(function(){busy=false;(window.requestIdleCallback||setTimeout)(pump)})}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);queue.push(e.target);need(pump)}})},{rootMargin:'400px'});
  function scan(root){(root||document).querySelectorAll('main img, article img, .post img').forEach(function(img){if(seen.has(img))return;seen.add(img);io.observe(img)})}
  /* when a photo changes (new story rotates in) or the layout reflows, frame it again */
  new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='attributes'&&m.target.tagName==='IMG'){seen.delete(m.target);m.target.dataset.fx=''}});scan()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){document.querySelectorAll('img[data-fx="1"]').forEach(function(img){queue.push(img)});need(pump)},400)});
  scan();
})();
