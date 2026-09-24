/* =========================================================
   Wanderbeans
   ========================================================= */
const BEAN_COLORS=['#FF5D73','#FF9F1C','#FFD23F','#3DDC97','#2EC4B6','#4D96FF','#9B5DE5','#F15BB5'];
// Outfits: a top and bottoms (any cloth color and pattern), shoes, and one extra.
// Everything not in the starter set is sold in the shop (see PRICES).
const CLOTH_COLORS=['#FFFFFF','#2B2040','#FF5D73','#FF9F1C','#FFD23F','#3DDC97','#4D96FF','#9B5DE5'];
const TOPS=[['none','Nothing',''],['tee','Tee','👕'],['hoodie','Hoodie','🧥'],['sweater','Sweater','🧶'],['raincoat','Raincoat','☔'],['tux','Tuxedo','🤵'],['cape','Hero cape','🦸']];
const BOTTOMS=[['none','Nothing',''],['shorts','Shorts','🩳'],['pants','Pants','👖'],['skirt','Skirt','👗'],['tutu','Tutu','🩰']];
const SHOES=[['plain','Plain',''],['sneakers','Sneakers','👟'],['boots','Boots','🥾'],['flippers','Flippers','🤿'],['rollers','Roller skates','🛼']];
const PATTERNS=[['solid','Plain'],['stripes','Stripes'],['dots','Dots'],['checks','Checks'],['stars','Stars'],['rainbow','Rainbow']];
const EXTRAS=[['none','None',''],['scarf','Scarf','🧣'],['bowtie','Bow tie','🎀'],['glasses','Glasses','👓'],['backpack','Backpack','🎒'],['floatie','Duck floatie','🦆'],['balloon','Balloon','🎈'],['wings','Fairy wings','🧚'],['medal','Gold medal','🏅']];
const DEFAULT_FIT={t:'tee',tc:6,tp:'solid',b:'shorts',bc:1,bp:'solid',s:'plain',sc:1,x:'none'};
function safeFit(f){
  f=f&&typeof f==='object'?f:{};
  const one=(list,v,d)=>list.some(o=>o[0]===v)?v:d;
  const ci=(v,d)=>Number.isInteger(v)&&v>=0&&v<CLOTH_COLORS.length?v:d;
  const oldStripy=f.t==='stripes'; // saves from before patterns had a "Stripy" top
  return {t:oldStripy?'sweater':one(TOPS,f.t,'none'),tc:ci(f.tc,0),tp:oldStripy?'stripes':one(PATTERNS,f.tp,'solid'),
    b:one(BOTTOMS,f.b,'none'),bc:ci(f.bc,0),bp:one(PATTERNS,f.bp,'solid'),s:one(SHOES,f.s,'plain'),sc:ci(f.sc,1),x:one(EXTRAS,f.x,'none')};
}
// radius of the bean's capsule body at height y (centre 0.81, radius 0.5, straight part 0.5–1.12)
const bodyR=y=>y<0.5?Math.sqrt(Math.max(0,0.25-(0.5-y)**2)):y>1.12?Math.sqrt(Math.max(0,0.25-(y-1.12)**2)):0.5;
// a garment shell hugging the body from y0 to y1; flare widens the bottom hem
function shell(y0,y1,mat,flare){
  const pts=[];const n=10;
  for(let i=0;i<=n;i++){const y=lerp(y0,y1,i/n);pts.push(new THREE.Vector2(bodyR(y)+0.035+(flare||0)*(1-i/n)**2,y));}
  return mk(new THREE.LatheGeometry(pts,24),null,{mat,w:0.03});
}
// the second color of a pattern: ink on light cloth, white on everything else
function patAlt(col){const c=new THREE.Color(col);return (0.299*c.r+0.587*c.g+0.114*c.b)>0.72?'#2B2040':'#FFFFFF';}
const RAINBOW=['#FF5D73','#FF9F1C','#FFD23F','#3DDC97','#4D96FF','#9B5DE5'];
function starPath(x,cx,cy,r){x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*0.45:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.closePath();}
const patCache=new Map();
function clothMat(col,pat,side){
  const k=col+'|'+(pat||'solid')+'|'+(side||0);if(patCache.has(k))return patCache.get(k);
  let m;
  if(!pat||pat==='solid')m=side?new THREE.MeshToonMaterial({color:col,gradientMap:gradTex,side}):M(col);
  else{
    const alt=patAlt(col);
    const t=canvasTex(64,64,(x,W,H)=>{
      x.fillStyle=col;x.fillRect(0,0,W,H);x.fillStyle=alt;
      if(pat==='stripes'){x.fillRect(0,0,W,H/4);x.fillRect(0,H/2,W,H/4);}
      else if(pat==='dots'){for(const[px,py]of[[16,16],[48,48]]){x.beginPath();x.arc(px,py,8,0,TAU);x.fill();}}
      else if(pat==='checks'){x.globalAlpha=0.55;x.fillRect(0,0,W/2,H/2);x.fillRect(W/2,H/2,W/2,H/2);}
      else if(pat==='stars'){x.fillStyle='#FFD23F';for(const[px,py]of[[16,18],[48,50]]){starPath(x,px,py,11);x.fill();}}
      else if(pat==='rainbow'){RAINBOW.forEach((c,i)=>{x.fillStyle=c;x.fillRect(0,i*H/6,W,H/6+1);});}
    });
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(10,pat==='rainbow'?1:1.5);
    m=MT(t,side?{side}:undefined);
  }
  patCache.set(k,m);return m;
}
// add a child to a squashed foot, in world-ish units (feet are scaled 1, 0.55, 1.4)
function onFoot(f,m,x,y,z,sx,sy,sz){m.position.set(x,y/0.55,z/1.4);m.scale.set(sx,sy/0.55,sz/1.4);f.add(m);return m;}
// returns parts that animate (fairy wings)
function dressBean(body,arms,feet,fit){
  const tc=CLOTH_COLORS[fit.tc],bc=CLOTH_COLORS[fit.bc],sc=CLOTH_COLORS[fit.sc];const out={wings:[]};
  if(fit.t==='cape'){
    const cape=new THREE.Mesh(new THREE.CylinderGeometry(0.58,0.8,0.95,18,1,true,Math.PI*0.62,Math.PI*0.76),clothMat(tc,fit.tp,THREE.DoubleSide));
    cape.position.y=0.55;cape.castShadow=true;body.add(cape);
    body.add(rot(at(mk(new THREE.TorusGeometry(0.47,0.05,6,24),'#FFD23F',{w:0.02}),0,0.99,0),Math.PI/2,0,0));
    body.add(at(sph(0.07,'#FFD23F',8,6,{w:0.015}),0,0.95,0.5));
  }else if(fit.t!=='none'){
    const mat=clothMat(tc,fit.tp);
    const long=fit.t!=='tee';
    body.add(shell(fit.t==='raincoat'?0.3:fit.t==='tux'?0.36:0.46,0.94,mat,fit.t==='raincoat'?0.08:fit.t==='tux'?0.03:0));
    for(const a of arms){const sl=mk(new THREE.CylinderGeometry(0.14,0.15,long?0.38:0.2,10,1,true),null,{mat,w:0.025});sl.position.y=long?-0.17:-0.06;a.add(sl);}
    if(fit.t==='hoodie'){
      body.add(rot(at(mk(new THREE.TorusGeometry(0.45,0.09,8,24),tc,{w:0.025}),0,0.95,-0.04),Math.PI/2+0.12,0,0));
      body.add(at(box(0.44,0.16,0.06,tc,{w:0.025}),0,0.64,0.52));
      for(const s of[-1,1])body.add(at(cyl(0.018,0.018,0.16,'#FFFFFF',5,{ol:false}),0.1*s,0.86,0.53));
    }
    if(fit.t==='sweater')body.add(rot(at(mk(new THREE.TorusGeometry(0.47,0.045,6,24),tc,{w:0.02}),0,0.94,0),Math.PI/2,0,0));
    if(fit.t==='raincoat'){
      body.add(rot(at(mk(new THREE.TorusGeometry(0.43,0.07,8,24),tc,{w:0.025}),0,0.95,0),Math.PI/2,0,0));
      for(let i=0;i<3;i++)body.add(at(sph(0.035,'#2B2040',6,5,{ol:false}),0,0.82-i*0.18,0.54+(i===2?0.02:0)));
    }
    if(fit.t==='tux'){
      body.add(at(box(0.24,0.46,0.04,'#FFFFFF',{w:0.015}),0,0.7,0.54));                       // shirt front
      for(const s of[-1,1]){body.add(rot(at(box(0.09,0.4,0.03,tc,{w:0.015}),0.15*s,0.74,0.545),0,0,0.28*s));
        body.add(rot(at(cone(0.06,0.11,'#2B2040',8,{ol:false}),0.06*s,0.89,0.56),0,0,s*Math.PI/2));}
      body.add(at(sph(0.035,'#2B2040',6,5,{ol:false}),0,0.89,0.575));
      for(let i=0;i<2;i++)body.add(at(sph(0.022,'#2B2040',6,5,{ol:false}),0,0.72-i*0.14,0.565));
    }
  }
  if(fit.b!=='none'){
    const mat=clothMat(bc,fit.bp);
    if(fit.b==='skirt')body.add(shell(0.24,0.52,mat,0.1));
    else if(fit.b==='tutu'){body.add(shell(0.36,0.54,mat,0.3));body.add(shell(0.4,0.56,clothMat(patAlt(bc)==='#FFFFFF'?'#FFFFFF':bc,'solid'),0.2));}
    else body.add(shell(0.22,0.52,mat));
    if(fit.b==='pants')for(const f of feet)onFoot(f,mk(new THREE.CylinderGeometry(0.1,0.12,0.18,8),null,{mat,w:0.02}),0,0.14,0,1,1,1);
  }
  for(const f of feet){
    if(fit.s==='sneakers'){onFoot(f,sph(0.17,'#FFFFFF',10,6,{ol:false}),0,-0.035,0.01,1,0.35,1.45);onFoot(f,sph(0.035,'#FFFFFF',6,5,{ol:false}),0,0.075,0.1,1,1,1);}
    else if(fit.s==='boots'){onFoot(f,cyl(0.13,0.14,0.22,sc,10,{w:0.02}),0,0.13,-0.02,1,1,1);onFoot(f,sph(0.17,'#5B3A29',10,6,{ol:false}),0,-0.035,0,1,0.3,1.45);}
    else if(fit.s==='flippers')onFoot(f,sph(0.16,sc,10,6,{w:0.015}),0,-0.03,0.22,1.15,0.22,1.9);
    else if(fit.s==='rollers'){
      onFoot(f,box(0.26,0.04,0.42,'#FFFFFF',{w:0.015}),0,-0.05,0.02,1,1,1);
      for(const z of[-0.13,0.15])onFoot(f,cyl(0.055,0.055,0.2,'#FFD23F',10,{w:0.015}),0,-0.1,z,1,1,1).rotation.z=Math.PI/2;
    }
  }
  if(fit.x==='scarf'){
    body.add(rot(at(mk(new THREE.TorusGeometry(0.44,0.08,8,24),null,{mat:clothMat('#FF5D73','stripes'),w:0.025}),0,0.92,0),Math.PI/2,0,0));
    body.add(rot(at(box(0.14,0.34,0.06,'#FF5D73',{w:0.02}),0.22,0.74,0.5),0,0,0.12));
  }else if(fit.x==='bowtie'){
    for(const s of[-1,1])body.add(rot(at(cone(0.07,0.13,'#FF5D73',8,{w:0.02}),0.07*s,0.8,0.54),0,0,s*Math.PI/2));
    body.add(at(sph(0.04,'#E0435A',8,6,{w:0.015}),0,0.8,0.56));
  }else if(fit.x==='backpack'){
    body.add(at(box(0.5,0.5,0.22,'#FFD23F',{w:0.03}),0,0.8,-0.56));
    body.add(at(box(0.3,0.18,0.08,'#FF9F1C',{w:0.02}),0,0.68,-0.7));
    for(const s of[-1,1])body.add(at(box(0.07,0.36,0.03,'#2B2040',{ol:false}),0.22*s,0.76,0.48));
  }else if(fit.x==='glasses'){
    for(const s of[-1,1])body.add(at(mk(new THREE.TorusGeometry(0.14,0.025,6,18),'#2B2040',{ol:false,shadow:false}),0.17*s,1.16,0.53));
    body.add(at(box(0.08,0.025,0.025,'#2B2040',{ol:false,shadow:false}),0,1.18,0.54));
  }else if(fit.x==='medal'){
    for(const s of[-1,1])body.add(rot(at(box(0.06,0.24,0.02,s<0?'#4D96FF':'#FF5D73',{ol:false}),0.06*s,0.84,0.54),0,0,-0.35*s));
    body.add(rot(at(cyl(0.1,0.1,0.035,'#FFD23F',16,{w:0.015}),0,0.7,0.56),Math.PI/2,0,0));
  }else if(fit.x==='floatie'){
    body.add(rot(at(mk(new THREE.TorusGeometry(0.6,0.14,10,28),'#FFD23F',{w:0.03}),0,0.46,0),Math.PI/2,0,0));
    body.add(at(sph(0.17,'#FFD23F',12,10,{w:0.025}),0,0.7,0.62));
    for(const s of[-1,1])body.add(at(sph(0.035,'#1D1533',6,5,{ol:false}),0.07*s,0.75,0.76));
    body.add(rot(at(cone(0.06,0.14,'#FF9F1C',8,{w:0.015}),0,0.68,0.8),Math.PI/2,0,0));
  }else if(fit.x==='balloon'){
    // held out to the side: string from the right hand up to the balloon
    body.add(rot(at(cyl(0.012,0.012,1.32,'#2B2040',4,{ol:false,shadow:false}),0.74,1.2,0.05),0,0,-0.2));
    const b=sph(0.27,'#FF5D73',14,12,{w:0.025});b.scale.set(1,1.18,1);body.add(at(b,0.9,2.12,0.05));
    body.add(at(cone(0.05,0.07,'#FF5D73',6,{ol:false}),0.87,1.83,0.05));
  }else if(fit.x==='wings'){
    const wm=new THREE.MeshToonMaterial({color:'#BDEBFF',gradientMap:gradTex,transparent:true,opacity:0.85,side:THREE.DoubleSide});
    for(const s of[-1,1]){
      const piv=new THREE.Group();piv.position.set(0.1*s,0.95,-0.48);body.add(piv);
      for(const[y,sz]of[[0.12,0.34],[-0.16,0.24]]){const w=new THREE.Mesh(new THREE.SphereGeometry(sz,12,8),wm);w.scale.set(1.3,0.8,0.08);w.position.set(0.3*s,y,0);w.rotation.z=0.4*s;piv.add(w);}
      piv.userData.s=s;out.wings.push(piv);
    }
  }
  return out;
}
function nameTag(text,col){
  const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');
  if(x){x.font='900 30px Nunito, sans-serif';const w=Math.min(250,x.measureText(text).width+44);
    x.fillStyle='rgba(43,32,64,0.88)';rrect(x,(256-w)/2,8,w,48,24);x.fill();
    x.fillStyle=col;x.beginPath();x.arc((256-w)/2+20,32,8,0,TAU);x.fill();
    x.fillStyle='#FFFFFF';x.textAlign='left';x.textBaseline='middle';x.fillText(text,(256-w)/2+34,34);}
  const t=new THREE.CanvasTexture(c);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
  s.scale.set(2.4,0.6,1);s.renderOrder=20;return s;
}
let beanSeq=0;
function makeBean(col,fitIn,name,into){
  const fit=safeFit(fitIn);
  const g=new THREE.Group();const body=new THREE.Group();g.add(body);
  const skin=mk(new THREE.CapsuleGeometry(0.5,0.62,6,16),col,{w:0.055});skin.position.y=0.81;body.add(skin);
  const belly=mk(new THREE.SphereGeometry(0.34,12,10),'#FFFFFF',{ol:false});belly.scale.set(1,1.1,0.4);belly.position.set(0,0.7,0.34);belly.material=new THREE.MeshToonMaterial({color:new THREE.Color(col).lerp(new THREE.Color('#FFFFFF'),0.45),gradientMap:gradTex});body.add(belly);
  for(const s of[-1,1]){
    const eye=mk(new THREE.SphereGeometry(0.15,12,10),'#FFFFFF',{w:0.025,shadow:false});eye.scale.set(1,1.2,0.6);eye.position.set(0.17*s,1.16,0.42);body.add(eye);
    const pu=mk(new THREE.SphereGeometry(0.075,10,8),'#1D1533',{ol:false,shadow:false});pu.position.set(0.17*s,1.15,0.5);body.add(pu);
    const bl=mk(new THREE.SphereGeometry(0.08,8,6),'#FF8FA8',{ol:false,shadow:false});bl.scale.set(1.2,0.6,0.4);bl.position.set(0.33*s,0.98,0.38);body.add(bl);
  }
  const arms=[];
  for(const s of[-1,1]){const p=new THREE.Group();p.position.set(0.5*s,0.92,0);const a=mk(new THREE.CapsuleGeometry(0.11,0.26,4,8),col,{w:0.035});a.position.y=-0.22;p.add(a);p.rotation.z=0.25*s;body.add(p);arms.push(p);}
  const feet=[];for(const s of[-1,1]){const f=mk(new THREE.SphereGeometry(0.16,8,6),CLOTH_COLORS[fit.sc],{ol:fit.s!=='plain',w:0.02});f.scale.set(1,0.55,1.4);f.position.set(0.2*s,0.07,0.06);g.add(f);feet.push(f);}
  // signature swiveling spyglass antenna
  const ant=new THREE.Group();ant.position.set(0,1.38,-0.26);ant.rotation.x=-0.35;
  ant.add(at(cyl(0.028,0.028,0.46,'#2B2040',5,{ol:false}),0,0.23,0));
  const scope=new THREE.Group();scope.position.y=0.5;
  scope.add(rot(at(cyl(0.07,0.095,0.4,'#E3B04B',10,{w:0.025}),0,0,0),Math.PI/2,0,0));
  scope.add(rot(at(cyl(0.08,0.08,0.03,'#9FE8FF',10,{ol:false}),0,0,0.21),Math.PI/2,0,0));
  ant.add(scope);body.add(ant);
  const dressed=dressBean(body,arms,feet,fit);
  const tag=nameTag(name||'',col);tag.position.y=2.55;g.add(tag);
  g.userData={body,arms,feet,ant,scope,tag,id:beanSeq++,col,fit,name,wings:dressed.wings};
  (into||scene).add(g);return g;
}
function animBean(b,st,t){
  const u=b.userData;let bob=0,sq=1+0.025*Math.sin(t*2.5+u.id),sw=0,armA=0.25,spin=0;
  if(st.an===1||st.an===2){const f=st.an===2?15:11;bob=Math.abs(Math.sin(t*f))*0.14;sq=1+0.06*Math.sin(t*f*2);sw=Math.sin(t*f)*0.9;
    u.feet[0].position.z=0.06+Math.sin(t*f)*0.18;u.feet[1].position.z=0.06-Math.sin(t*f)*0.18;}
  else{u.feet[0].position.z=u.feet[1].position.z=0.06;}
  if(st.an===3){sq=1.13;armA=1.3;}
  let a0x=sw,a0z=-armA,a1x=-sw,a1z=armA;
  const age=(Date.now()-(st.emAt||0))/1000;
  if(st.em&&age<2.8){
    if(st.em==='wave'){a1x=0;a1z=2.7+0.35*Math.sin(age*14);}
    else if(st.em==='point'){a1x=-1.55;a1z=0.15;}
    else if(st.em==='dance'){spin=age*8;a0z=-2.3+Math.sin(age*10)*0.3;a1z=2.3-Math.sin(age*10)*0.3;bob=Math.abs(Math.sin(age*10))*0.2;}
    else if(st.em==='shrug'){a0z=-1.3;a1z=1.3;a0x=a1x=-0.4;sq=0.94;}
    else if(st.em==='cheer'||st.em==='yay'){spin=age*11;bob=Math.abs(Math.sin(age*7))*0.7;a0z=-2.8;a1z=2.8;}
  }
  u.body.position.y=bob;
  const k=1/Math.sqrt(sq);u.body.scale.set(k,sq,k);
  u.arms[0].rotation.set(a0x,0,a0z);u.arms[1].rotation.set(a1x,0,a1z);
  u.body.rotation.y=spin;
  for(const w of u.wings)w.rotation.y=w.userData.s*(0.35+0.3*Math.sin(t*(st.an?9:4)+u.id));
  u.ant.rotation.y=Math.sin(t*0.9+u.id)*0.9;u.scope.rotation.y=Math.sin(t*0.6+u.id*2)*0.5;
}

