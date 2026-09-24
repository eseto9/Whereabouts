/* =========================================================
   WHEREABOUTS — core engine
   ========================================================= */
const $=s=>document.querySelector(s);
const V3=THREE.Vector3;
const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);};
const damp=(k,dt)=>1-Math.exp(-k*dt);
const angLerp=(a,b,t)=>{const d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*t;};
let seed=20260924;
const srand=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
const sr=(a,b)=>a+srand()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const wclock=()=>(Date.now()/1000)%100000;   // shared-ish clock so moving things line up between players

// graphics quality: auto picks high on computers and mid on phones
const GFX=(()=>{
  let q='auto';try{q=localStorage.getItem('wb.gfx')||'auto';}catch(e){}
  const coarse=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  const lvl=q==='high'||q==='low'?q:(coarse?'mid':'high');
  // cull: small things aren't drawn beyond this; ink: outlines aren't drawn beyond this
  return {q,lvl,pr:lvl==='high'?2:lvl==='mid'?1.5:1,shadow:lvl!=='low',smap:lvl==='high'?2048:1024,cull:lvl==='high'?90:lvl==='mid'?60:42,ink:lvl==='high'?1e9:lvl==='mid'?40:26,aa:lvl!=='low'};
})();
const canvas=$('#c');
let renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:GFX.aa,powerPreference:'high-performance'});
}catch(e){ $('#nogl').hidden=false; $('#loading').hidden=true; return; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,GFX.pr));
renderer.setSize(window.innerWidth,window.innerHeight,false);
renderer.shadowMap.enabled=GFX.shadow;
if(GFX.shadow&&GFX.lvl!=='high')renderer.shadowMap.autoUpdate=false;   // refreshed every other frame instead
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
const HORIZON=new THREE.Color('#FFD2A1');
scene.background=HORIZON.clone();
scene.fog=new THREE.Fog(HORIZON,120,380);
const camera=new THREE.PerspectiveCamera(62,window.innerWidth/window.innerHeight,0.1,1600);
camera.position.set(60,40,60);

/* ---------- lights: golden hour ---------- */
const hemi=new THREE.HemisphereLight(0xCFE2FF,0xF6B98C,0.72);
scene.add(hemi);
const SUN_DIR=new V3(-0.55,0.6,0.58).normalize();
const sun=new THREE.DirectionalLight(0xFFE0B0,1.0);
sun.position.copy(SUN_DIR).multiplyScalar(140);
sun.castShadow=GFX.shadow;
sun.shadow.mapSize.set(GFX.smap,GFX.smap);
{const c=sun.shadow.camera;c.left=-82;c.right=82;c.top=82;c.bottom=-82;c.near=20;c.far=320;}
sun.shadow.bias=-0.0006;
sun.shadow.normalBias=0.05;
scene.add(sun,sun.target);

/* ---------- toon materials + ink outlines ---------- */
const gradTex=(()=>{
  const d=new Uint8Array([112,112,112,255, 188,188,188,255, 255,255,255,255]);
  const t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat);
  t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; return t;
})();
const matCache=new Map();
function M(color){
  const k=String(color);
  if(!matCache.has(k)) matCache.set(k,new THREE.MeshToonMaterial({color,gradientMap:gradTex}));
  return matCache.get(k);
}
function MT(map,extra){ return new THREE.MeshToonMaterial(Object.assign({map,gradientMap:gradTex},extra||{})); }
const INK=new THREE.MeshBasicMaterial({color:0x2B2040,side:THREE.BackSide});
const GOLD=new THREE.MeshBasicMaterial({color:0xFFD23F,side:THREE.BackSide});
const RED=new THREE.MeshBasicMaterial({color:0xFF3B5C,side:THREE.BackSide});
const SPYMAT=new THREE.MeshBasicMaterial({color:0x3DDC97,side:THREE.BackSide});

function outline(mesh,w){
  const g=mesh.geometry;
  if(!g.boundingBox) g.computeBoundingBox();
  const s=new V3(), c=new V3();
  g.boundingBox.getSize(s); g.boundingBox.getCenter(c);
  const o=new THREE.Mesh(g,INK);
  const sx=(s.x+2*w)/Math.max(s.x,1e-3), sy=(s.y+2*w)/Math.max(s.y,1e-3), sz=(s.z+2*w)/Math.max(s.z,1e-3);
  o.scale.set(s.x<1e-3?1:sx, s.y<1e-3?1:sy, s.z<1e-3?1:sz);
  o.position.set(c.x*(1-o.scale.x),c.y*(1-o.scale.y),c.z*(1-o.scale.z));
  o.userData.isOutline=true;
  o.raycast=()=>{};
  mesh.add(o);
  return o;
}
function mk(geo,color,opt){
  opt=opt||{};
  const m=new THREE.Mesh(geo,opt.mat||M(color));
  if(!geo.boundingBox) geo.computeBoundingBox();
  const s=new V3(); geo.boundingBox.getSize(s);
  m.castShadow=opt.shadow!==undefined?opt.shadow:Math.max(s.x,s.y,s.z)>0.45;
  m.receiveShadow=true;
  if(opt.ol!==false) outline(m,opt.w!==undefined?opt.w:0.045);
  return m;
}
const box=(w,h,d,c,o)=>mk(new THREE.BoxGeometry(w,h,d),c,o);
const cyl=(rt,rb,h,c,seg,o)=>mk(new THREE.CylinderGeometry(rt,rb,h,seg||10),c,o);
const sph=(r,c,ws,hs,o)=>mk(new THREE.SphereGeometry(r,ws||10,hs||8),c,o);
const cone=(r,h,c,seg,o)=>mk(new THREE.ConeGeometry(r,h,seg||10),c,o);
const cap=(r,l,c,o)=>mk(new THREE.CapsuleGeometry(r,l,4,10),c,o);
function at(m,x,y,z){m.position.set(x,y,z);return m;}
function rot(m,x,y,z){m.rotation.set(x||0,y||0,z||0);return m;}
function scl(m,x,y,z){m.scale.set(x,y===undefined?x:y,z===undefined?x:z);return m;}
function grp(){const g=new THREE.Group();for(const c of arguments)g.add(c);return g;}
function prismGeo(w,h,d){
  const s=new THREE.Shape(); s.moveTo(-w/2,0); s.lineTo(w/2,0); s.lineTo(0,h); s.lineTo(-w/2,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}); g.translate(0,0,-d/2); return g;
}
function canvasTex(w,h,draw){
  const c=document.createElement('canvas'); c.width=w; c.height=h;
  const x=c.getContext('2d'); if(x) draw(x,w,h);
  const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t;
}
function rrect(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();}
function signTex(text,bg,fg,w,h){
  return canvasTex(w||512,h||128,(x,W,H)=>{
    x.fillStyle=bg; x.fillRect(0,0,W,H);
    x.strokeStyle='#2B2040'; x.lineWidth=10; x.strokeRect(5,5,W-10,H-10);
    x.fillStyle=fg; x.textAlign='center'; x.textBaseline='middle';
    let fs=H*0.52; x.font=`${fs}px "Lilita One", "Arial Rounded MT Bold", sans-serif`;
    while(x.measureText(text).width>W*0.86&&fs>10){fs-=2;x.font=`${fs}px "Lilita One", sans-serif`;}
    x.fillText(text,W/2,H/2+3);
  });
}
function stripeTex(a,b,n){
  return canvasTex(128,32,(x,W,H)=>{const sw=W/n;for(let i=0;i<n;i++){x.fillStyle=i%2?b:a;x.fillRect(i*sw,0,sw+1,H);}});
}
function signBox(text,w,h,bg,fg){
  const t=signTex(text,bg,fg,512,Math.round(512*h/w));
  const side=M(bg);
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,0.15),[side,side,side,side,MT(t),side]);
  m.castShadow=true; outline(m,0.04); return m;
}

