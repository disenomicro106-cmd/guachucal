const $=id=>document.getElementById(id);
const S={cat:"nature",index:0,items:[],pos:0,target:0,drag:false,moved:false,raf:null,ht:0,lastTap:null,vel:0};
const hero=$('heroImage'),track=$('track'),viewport=document.querySelector('.viewport');
const mqVert=matchMedia('(max-width:900px)');
let cards=[],step=0,vert=false;
const mod=(a,n)=>((a%n)+n)%n;
const pad=n=>String(n).padStart(2,'0');
const EPS=1e-6;
const dOf=(i,pos,n)=>mod(i-pos+1-EPS,n)-1+EPS;  // posición relativa; con 2 tarjetas ambas quedan visibles
function currentItems(){return CONTENT[S.cat].items}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

/* ---------- Tarjetas ----------
   Carrusel infinito con posición continua (S.pos). La tarjeta "activa" es siempre la que queda
   de PRIMERA (izquierda en escritorio/laptop, arriba en móvil) y su imagen es el fondo. */
function buildCards(){
 S.items=currentItems();track.innerHTML='';
 S.items.forEach((x,i)=>{
  const c=document.createElement('article');c.className='card';c.dataset.real=i;
  c.innerHTML=`<img src="${x.image}" alt="${esc(x.title)}" draggable="false"><div class="card-info"><div class="card-index">${pad(i+1)}</div><div class="card-title">${esc(x.title)}</div><div class="card-location">${esc(x.location)}</div></div>`;
  track.appendChild(c);
 });
 cards=[...track.children];
 S.pos=S.target=S.index;
 layout();render();updateInfo();heroChange(S.items[S.index]);
}
function layout(){
 if(!cards.length)return;
 vert=mqVert.matches;
 const gap=vert?10:13;
 track.style.height='';cards.forEach(c=>{c.style.width='';c.style.height=''});
 if(vert){
  const w=track.clientWidth,h=Math.round(w*1.08);
  cards.forEach(c=>{c.style.width=w+'px';c.style.height=h+'px'});step=h+gap;
 }else{
  const w=(track.clientWidth-2*gap)/3;
  cards.forEach(c=>c.style.width=w+'px');
  track.style.height=cards[0].offsetHeight+'px';step=w+gap;
 }
}
function render(){
 const n=S.items.length;if(!n)return;
 const act=mod(Math.round(S.pos),n);
 cards.forEach((c,i)=>{
  const d=dOf(i,S.pos,n);               // -1 (sale) ... 0 (primera) ... n-1
  const lift=-8*Math.max(0,1-Math.abs(d));
  const off=d*step;
  c.style.transform=vert?`translate3d(${lift}px,${off}px,0)`:`translate3d(${off}px,${lift}px,0)`;
  c.style.opacity=d<0?Math.max(0,1+d):1;
  c.style.pointerEvents=d<-.6?'none':'';
  c.classList.toggle('active',i===act);
 });
}
function tick(){
 const diff=S.target-S.pos;
 if(Math.abs(diff)<.0008){S.pos=S.target;render();S.raf=null;return}
 S.pos+=diff*.14;render();S.raf=requestAnimationFrame(tick);
}
function animate(){if(!S.raf)S.raf=requestAnimationFrame(tick)}
function updateInfo(){
 const x=S.items[S.index];if(!x)return;
 $('catName').textContent=CONTENT[S.cat].label;
 $('heroNum').textContent=pad(S.index+1);$('heroTitle').innerHTML=esc(x.title).replace(' – ','<br>– ');
 $('heroDesc').textContent=x.description;$('heroLoc').textContent=x.location;
 $('counter').textContent=`${pad(S.index+1)} / ${pad(S.items.length)}`;
 $('progress').style.width=`${((S.index+1)/S.items.length)*100}%`;
}
function heroChange(item){
 const t=++S.ht;hero.classList.add('fade');
 setTimeout(()=>{if(t!==S.ht)return;hero.src=item.image;hero.alt=item.title;hero.classList.remove('fade');revealText()},300);
}
function revealText(){document.querySelectorAll('.copy>*').forEach((e,i)=>{e.style.animation='none';void e.offsetWidth;e.style.animation=`textIn .9s cubic-bezier(.16,1,.3,1) ${i*.07}s both`})}
function setTarget(t){
 const n=S.items.length;S.target=t;
 const idx=mod(t,n);
 if(idx!==S.index){S.index=idx;updateInfo();heroChange(S.items[idx])}
 animate();
}
function move(dir){setTarget(Math.round(S.target)+dir)}
function select(i){const n=S.items.length;const d=dOf(i,S.pos,n);setTarget(Math.round(S.pos+d))}  // la tarjeta tocada pasa a ser la primera
function category(cat){
 S.cat=cat;S.index=0;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));
 document.querySelector('.hero').scrollIntoView({behavior:'smooth',block:'start'});buildCards();closeMenu();
}
$('next').onclick=()=>move(1);$('prev').onclick=()=>move(-1);
document.querySelectorAll('[data-cat]').forEach(b=>b.addEventListener('click',()=>category(b.dataset.cat)));

/* ---------- Arrastre (mouse y dedo), clic y doble clic ---------- */
viewport.addEventListener('dragstart',e=>e.preventDefault());
viewport.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 S.drag=true;S.moved=false;S.pid=e.pointerId;S.sx=e.clientX;S.sy=e.clientY;S.p0=S.pos;
 S.lastC=vert?e.clientY:e.clientX;S.lastT=performance.now();S.vel=0;S.downCard=e.target.closest('.card');
 if(S.raf){cancelAnimationFrame(S.raf);S.raf=null}
});
addEventListener('pointermove',e=>{
 if(!S.drag||e.pointerId!==S.pid)return;
 const c=vert?e.clientY:e.clientX,along=c-(vert?S.sy:S.sx);
 if(!S.moved&&Math.abs(along)>6){S.moved=true;track.classList.add('dragging')}
 if(!S.moved)return;
 S.pos=S.p0-along/step;render();
 const now=performance.now(),dt=now-S.lastT;
 if(dt>0){S.vel=S.vel*.6+(-(c-S.lastC)/step/dt)*.4}
 S.lastC=c;S.lastT=now;
},{passive:true});
function dragEnd(e,cancelled){
 if(!S.drag||(e&&e.pointerId!==S.pid))return;
 S.drag=false;track.classList.remove('dragging');
 if(S.moved){
  const v=(performance.now()-S.lastT>90)?0:S.vel;
  setTarget(Math.round(S.pos+Math.max(-2,Math.min(2,v*220))));
  return;
 }
 const card=S.downCard;
 if(card&&!cancelled){
  const idx=+card.dataset.real,now=performance.now();
  const t=S.lastTap;
  if(t&&now-t.t<380&&Math.hypot(e.clientX-t.x,e.clientY-t.y)<28){S.lastTap=null;select(t.idx);openDetail(t.idx)}   // doble clic = entrar
  else{S.lastTap={t:now,x:e.clientX,y:e.clientY,idx};select(idx)}                                                   // un clic = pasa a primera
 }else setTarget(Math.round(S.pos));
}
addEventListener('pointerup',e=>dragEnd(e,false));
addEventListener('pointercancel',e=>dragEnd(e,true));
let wheelT=0;
viewport.addEventListener('wheel',e=>{const v=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(v)<4)return;e.preventDefault();const now=performance.now();if(now-wheelT<380)return;wheelT=now;move(v>0?1:-1)},{passive:false});

/* ---------- Vista individual ---------- */
$('explore').onclick=()=>openDetail(S.index);
function waLink(x){const msg=`¡Hola! Quiero información sobre "${x.title}" (${CONTENT[S.cat].label}) en Guachucal.`;return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`}
function openDetail(i){
 const x=S.items[i];if(!x)return;
 $('detailImage').src=x.detailImage||x.image;$('detailImage').alt=x.title;$('detailCat').textContent=CONTENT[S.cat].label;$('detailNum').textContent=pad(i+1);
 $('detailTitle').textContent=x.title;$('detailLoc').textContent=x.location;$('detailDesc').textContent=x.description;$('detailGo').href=waLink(x);
 $('detailImage').onerror=function(){if(x.image&&this.getAttribute('src')!==x.image)this.src=x.image};
 $('detailScroll').scrollTop=0;
 $('detail').classList.add('open');$('detail').setAttribute('aria-hidden','false');document.body.classList.add('detail-open');
 loadGallery(x);
}
function closeDetail(){galToken++;document.querySelectorAll('#galleryGrid video').forEach(v=>v.pause());$('detail').classList.remove('open');$('detail').setAttribute('aria-hidden','true');document.body.classList.remove('detail-open')}

/* ---------- Galería automática ----------
   Busca galeria/<categoria>/<carpeta>/1.jpg, 2.jpg, 3.mp4 ... hasta que falte un número.
   También acepta nombres como "<carpeta> 1.jpg". No hay que editar código al agregar archivos. */
const GAL_ROOT='galeria',CAT_DIR={nature:'naturaleza',stay:'alojamiento',local:'productos'};
const IMG_EXT=['jpg','jpeg','png','webp','JPG','JPEG','PNG','WEBP'],VID_EXT=['mp4','webm','mov','MP4','MOV'],GAL_MAX=60;
const galCache={};let galToken=0,galObs=null;
const slugify=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
function probeImg(url){return new Promise(r=>{const i=new Image();i.onload=()=>r({type:'img',url,w:i.naturalWidth||4,h:i.naturalHeight||3});i.onerror=()=>r(null);i.src=url})}
function probeVid(url){return new Promise(r=>{const v=document.createElement('video');let done=false;const end=o=>{if(done)return;done=true;clearTimeout(t);v.removeAttribute('src');try{v.load()}catch(e){}r(o)};const t=setTimeout(()=>end(null),6000);v.preload='metadata';v.muted=true;v.onloadedmetadata=()=>end({type:'vid',url,w:v.videoWidth||16,h:v.videoHeight||9});v.onerror=()=>end(null);v.src=url})}
async function findMedia(base,names,n){
 const jobs=[];
 names.forEach(nm=>{const p=`${base}/${encodeURIComponent(nm+n)}`;IMG_EXT.forEach(e=>jobs.push(probeImg(`${p}.${e}`)));VID_EXT.forEach(e=>jobs.push(probeVid(`${p}.${e}`)))});
 return (await Promise.all(jobs)).find(Boolean)||null;
}
function addGalleryItem(m,title,n){
 const grid=$('galleryGrid'),f=document.createElement('figure');f.className='g-item';f.style.aspectRatio=`${m.w} / ${m.h}`;
 if(m.type==='img'){const im=document.createElement('img');im.src=m.url;im.alt=`${title} ${n}`;im.loading='lazy';im.decoding='async';f.appendChild(im)}
 else{const v=document.createElement('video');v.src=m.url+'#t=0.1';v.controls=true;v.playsInline=true;v.preload='metadata';f.appendChild(v)}
 grid.appendChild(f);
 if(!galObs)galObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');galObs.unobserve(e.target)}}),{root:$('detailScroll'),threshold:.08});
 galObs.observe(f);
}
function showGallery(title){$('galleryTitle').textContent=title;$('detailGallery').classList.add('has');$('scrollHint').classList.add('show')}
async function loadGallery(x){
 const t=++galToken,grid=$('galleryGrid');
 grid.innerHTML='';$('detailGallery').classList.remove('has');$('scrollHint').classList.remove('show');
 const folder=x.folder||slugify(x.title),base=`${GAL_ROOT}/${CAT_DIR[S.cat]}/${folder}`,names=['',`${folder} `,`${x.title} `];
 const cached=galCache[base];
 if(cached){cached.forEach((m,i)=>addGalleryItem(m,x.title,i+1));if(cached.length)showGallery(x.title);return}
 const found=[];
 for(let n=1;n<=GAL_MAX;n++){
  const m=await findMedia(base,names,n);
  if(t!==galToken)return;
  if(!m)break;
  found.push(m);addGalleryItem(m,x.title,n);if(n===1)showGallery(x.title);
 }
 galCache[base]=found;
}
$('detailClose').onclick=closeDetail;
addEventListener('keydown',e=>{
 if(e.key==='Escape'){closeDetail();closeMenu()}
 if($('detail').classList.contains('open'))return;
 if(e.key==='ArrowRight'||(vert&&e.key==='ArrowDown'))move(1);
 if(e.key==='ArrowLeft'||(vert&&e.key==='ArrowUp'))move(-1);
});

// Mobile full-screen glass menu.
const menu=$('mobileMenu'),menuBtn=$('menuBtn');
function openMenu(){menu.classList.add('open');menu.setAttribute('aria-hidden','false');menuBtn.textContent='CERRAR';document.body.style.overflow='hidden'}
function closeMenu(){menu.classList.remove('open');menu.setAttribute('aria-hidden','true');menuBtn.textContent='MENU';if(!$('detail').classList.contains('open'))document.body.style.overflow=''}
menuBtn.onclick=()=>menu.classList.contains('open')?closeMenu():openMenu();$('menuClose').onclick=closeMenu;$('mobileContact').onclick=()=>{closeMenu();setTimeout(()=>document.querySelector('#contact').scrollIntoView({behavior:'smooth'}),250)};

$('email').href=`mailto:${CONTACT.email}`;$('email').querySelector('span').textContent=CONTACT.email;$('whatsapp').href=`https://wa.me/${CONTACT.whatsapp}`;$('whatsapp').querySelector('span').textContent=CONTACT.phoneDisplay;$('year').textContent=new Date().getFullYear();
addEventListener('resize',()=>{layout();render()});

// WebGL liquid / water shader. It is deliberately visible: bright refractive rings follow the pointer.
if(window.THREE){
 const host=$('webgl-bg'),scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);host.appendChild(renderer.domElement);
 const uniforms={uTime:{value:0},uMouse:{value:new THREE.Vector2(.5,.5)},uRes:{value:new THREE.Vector2(innerWidth,innerHeight)}};
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,fragmentShader:`precision highp float;varying vec2 vUv;uniform float uTime;uniform vec2 uMouse;uniform vec2 uRes;void main(){vec2 uv=vUv;float ar=uRes.x/uRes.y;vec2 p=uv;p.x*=ar;vec2 m=uMouse;m.x*=ar;float d=distance(p,m);float ring=exp(-pow((d-.10-sin(uTime*1.4)*.008)*18.0,2.0));float ring2=exp(-pow((d-.19-sin(uTime*1.1)*.012)*13.0,2.0));float shimmer=sin(d*80.0-uTime*3.0)*.5+.5;float a=(ring*.24+ring2*.12)*(.45+.55*shimmer);vec3 col=vec3(.72,.91,.86);gl_FragColor=vec4(col,a);}`});
 scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));let tx=.5,ty=.5;addEventListener('pointermove',e=>{tx=e.clientX/innerWidth;ty=1-e.clientY/innerHeight},{passive:true});addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);uniforms.uRes.value.set(innerWidth,innerHeight)});
 function loop(t){requestAnimationFrame(loop);uniforms.uTime.value=t*.001;uniforms.uMouse.value.x+=(tx-uniforms.uMouse.value.x)*.08;uniforms.uMouse.value.y+=(ty-uniforms.uMouse.value.y)*.08;renderer.render(scene,camera)}loop(0);
}
window.addEventListener('load',()=>buildCards());
