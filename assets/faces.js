/* WDCM NEXT: face-aware framing.
   Every cropped photo on the site is scanned with a real face detector (face-api TinyFaceDetector).
   The faces found are kept inside their box: centred across, heads in the upper part of the frame,
   recalculated whenever a box changes size (phones, rotations, rotating stories). Results are cached. */
(function(){
  var LIB='https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/dist/face-api.js',
      MODEL='https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model',
      ready=null,faces={},pending={},queue=[],busy=false,seen=new WeakSet();
  try{faces=JSON.parse(localStorage.getItem('wdcm_faces_v1')||'{}')}catch(e){faces={}}
  function save(){try{var k=Object.keys(faces);if(k.length>400)k.slice(0,k.length-400).forEach(function(x){delete faces[x]});localStorage.setItem('wdcm_faces_v1',JSON.stringify(faces))}catch(e){}}
  function boot(){if(ready)return ready;ready=new Promise(function(res,rej){var s=document.createElement('script');s.src=LIB;s.onload=function(){
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL).then(res,rej)};s.onerror=rej;document.head.appendChild(s)});return ready}
  function base(u){return (u||'').replace(/\/content\/images\/size\/w\d+\//,'/content/images/').split('?')[0]}
  function probe(u){return /\/content\/images\//.test(u)?u.replace(/\/content\/images\/(size\/w\d+\/)?/,'/content/images/size/w600/'):u}
  function covers(img){return getComputedStyle(img).objectFit==='cover'}

  /* place an image so its faces sit well inside the box */
  function place(img){var f=faces[base(img.currentSrc||img.src)];var bw=img.clientWidth,bh=img.clientHeight;if(!f||!bw||!bh)return;
    var W=f.w,H=f.h,s=Math.max(bw/W,bh/H),rw=W*s,rh=H*s,px=50,py=35;
    if(f.b&&f.b.length){var L=1,T=1,R=0,B=0,big=0;f.b.forEach(function(b){big=Math.max(big,b[2]*b[3])});
      f.b.forEach(function(b){if(b[2]*b[3]<big*.18)return;L=Math.min(L,b[0]);T=Math.min(T,b[1]);R=Math.max(R,b[0]+b[2]);B=Math.max(B,b[1]+b[3])});
      var cx=(L+R)/2,cy=(T+B)/2,fh=(B-T)*rh;
      var ox=bw*(parseFloat(img.dataset.fcx)||.5)-cx*rw;ox=Math.min(0,Math.max(bw-rw,ox));
      /* heads around 40% down, never touching the top, chin kept inside where possible */
      var oy=bh*.40-cy*rh;var minTop=bh*.07-T*rh;if(oy<minTop)oy=minTop;var maxBot=bh*.97-B*rh;if(fh<bh*.85&&oy>maxBot)oy=Math.max(minTop,maxBot);
      oy=Math.min(0,Math.max(bh-rh,oy));
      px=rw-bw>1?ox/(bw-rw)*100:50;py=rh-bh>1?oy/(bh-rh)*100:50}
    img.style.objectPosition=px.toFixed(1)+'% '+py.toFixed(1)+'%';img.dataset.fx='1'}

  function detect(src){var k=base(src);if(faces[k])return Promise.resolve();if(pending[k])return pending[k];
    pending[k]=boot().then(function(){return new Promise(function(res){var im=new Image();im.crossOrigin='anonymous';
      im.onload=function(){faceapi.detectAllFaces(im,new faceapi.TinyFaceDetectorOptions({inputSize:512,scoreThreshold:.38})).then(function(d){
          var W=im.naturalWidth,H=im.naturalHeight;faces[k]={w:W,h:H,b:d.map(function(x){var b=x.box;return [+(b.x/W).toFixed(4),+(b.y/H).toFixed(4),+(b.width/W).toFixed(4),+(b.height/H).toFixed(4)]})};save();res()}).catch(function(){faces[k]={w:W,h:H,b:[]};res()})};
      im.onerror=function(){res()};im.src=probe(src)})}).catch(function(){});return pending[k]}

  var ro=new ResizeObserver(function(es){es.forEach(function(e){place(e.target)})});
  function pump(){if(busy||!queue.length)return;busy=true;var img=queue.shift();
    (img.complete&&img.naturalWidth?Promise.resolve():new Promise(function(r){img.addEventListener('load',r,{once:true});img.addEventListener('error',r,{once:true})}))
      .then(function(){if(!covers(img))return;var src=img.currentSrc||img.src;if(!src||/\.svg|data:|espncdn/.test(src))return;return detect(src).then(function(){place(img);ro.observe(img)})})
      .then(function(){busy=false;setTimeout(pump,0)})}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);var f=faces[base(e.target.currentSrc||e.target.src)];if(f){place(e.target);ro.observe(e.target)}else{queue.push(e.target);pump()}}})},{rootMargin:'600px'});
  function scan(){document.querySelectorAll('main img, article img, .post img').forEach(function(img){if(seen.has(img))return;seen.add(img);io.observe(img)})}
  new MutationObserver(function(ms){ms.forEach(function(m){if(m.type==='attributes'&&m.target.tagName==='IMG'){seen.delete(m.target);m.target.dataset.fx=''}});scan()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
  scan();
})();
