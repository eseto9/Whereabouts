/* =========================================================
   CROWDED MARKET — the world: supplier spots, stall shelves and
   price tags, customers with their request bubbles, the rival
   shopkeepers and what everyone carries. It only reads the
   game state; nothing here changes it.
   ========================================================= */
const CMW={root:null,built:false,hidden:[],obstacles:[],grid:null,stalls:[],sup:{},cust:new Map(),beans:new Map(),ring:null,carry:null,bubbles:[]};

/* ---------- text on a sprite: bubbles, price tags, signs ---------- */
const CM_STYLES={
  bubble:{bg:'#FFFFFF',fg:'#2B2040',r:26,tail:true},
  think:{bg:'#FFF3D6',fg:'#2B2040',r:26,tail:true},
  happy:{bg:'#3DDC97',fg:'#2B2040',r:26,tail:true},
  sad:{bg:'#C9BEE8',fg:'#2B2040',r:26,tail:true},
  tag:{bg:'#FFD23F',fg:'#2B2040',r:14},
  out:{bg:'#E6E0F2',fg:'#6B5F86',r:14},
  say:{bg:'#2B2040',fg:'#FFFFFF',r:26,tail:true},
  sign:{bg:'#FFF3D6',fg:'#2B2040',r:18},
};
// world: true → sized in metres (h = height); false → the same size on screen wherever it is
function cmSprite(h,world){
  const c=document.createElement('canvas');c.width=64;c.height=64;
  const m=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,sizeAttenuation:world!==false});
  const s=new THREE.Sprite(m);s.renderOrder=20;s.userData={c,key:'',h,world:world!==false};s.center.set(0.5,0);return s;
}
function cmText(s,text,style){
  const key=text+'|'+style;if(s.userData.key===key)return;s.userData.key=key;
  const st=CM_STYLES[style]||CM_STYLES.bubble,c=s.userData.c,H=96,pad=26,tail=st.tail?18:0;
  let x=c.getContext('2d');if(!x)return;
  const font='900 46px Nunito, "Segoe UI Emoji", "Apple Color Emoji", sans-serif';x.font=font;
  const w=Math.min(1024,Math.ceil(x.measureText(text).width)+pad*2);
  c.width=w+8;c.height=H+tail+8;x=c.getContext('2d');x.font=font;
  x.fillStyle=st.bg;x.strokeStyle='#2B2040';x.lineWidth=6;
  rrect(x,4,4,w,H,st.r);x.fill();x.stroke();
  if(tail){x.beginPath();x.moveTo(c.width/2-14,H+2);x.lineTo(c.width/2,H+tail+2);x.lineTo(c.width/2+14,H+2);x.closePath();x.fill();x.stroke();
    x.fillRect(c.width/2-12,H-4,24,6);}
  x.fillStyle=st.fg;x.textAlign='center';x.textBaseline='middle';x.fillText(text,c.width/2,4+H/2+2);
  const m=s.material;m.map.dispose();m.map=new THREE.CanvasTexture(c);m.needsUpdate=true;
  const hh=s.userData.h;s.scale.set(hh*c.width/c.height,hh,1);
}

/* ---------- little goods for shelves, crates and signs ---------- */
function cmGoodMesh(g){
  const o={w:0.018};const grp_=new THREE.Group();
  if(g==='fish'){grp_.add(scl(at(sph(0.1,'#8FB7D6',8,6,o),0,0.07,0),2.1,0.6,0.8));grp_.add(rot(at(cone(0.08,0.12,'#6E97BA',3,o),-0.25,0.07,0),0,0,Math.PI/2));}
  else if(g==='bread'){grp_.add(rot(at(cyl(0.07,0.07,0.42,'#E8B26A',8,o),0,0.07,0),0,0,Math.PI/2));}
  else if(g==='flowers'){grp_.add(at(cyl(0.02,0.02,0.3,'#4CB85A',5,{ol:false}),0,0.15,0));for(let i=0;i<3;i++)grp_.add(at(sph(0.06,['#F15BB5','#FFD23F','#9B5DE5'][i],6,4,o),Math.cos(i*2.1)*0.06,0.32,Math.sin(i*2.1)*0.06));}
  else if(g==='fruit'){grp_.add(at(sph(0.1,'#E8323F',8,6,o),0,0.1,0));grp_.add(at(cyl(0.01,0.01,0.06,'#5B3A29',4,{ol:false}),0,0.21,0));}
  else if(g==='cheese'){grp_.add(at(cyl(0.14,0.14,0.1,'#FFD23F',10,o),0,0.05,0));}
  else if(g==='teapot'){grp_.add(scl(at(sph(0.11,'#2EC4B6',10,8,o),0,0.1,0),1,0.85,1));grp_.add(rot(at(cyl(0.015,0.03,0.12,'#2EC4B6',5,{ol:false}),0.13,0.13,0),0,0,-0.9));grp_.add(at(sph(0.03,'#2EC4B6',5,4,{ol:false}),0,0.2,0));}
  return grp_;
}

/* ---------- supplier spots: a prop, a signpost and a marker you can see from anywhere ---------- */
const CM_PROPS={
  fish:{dx:2.3,dz:0.4,ry:0,make(){const g=new THREE.Group();g.add(at(box(1.4,0.5,0.9,'#E6F7FF'),0,0.25,0));for(let i=0;i<3;i++){const f=cmGoodMesh('fish');f.position.set(-0.4+i*0.4,0.5,0);g.add(f);}
    g.add(at(box(0.9,0.6,0.7,'#B5793A'),0,0.3,-1.1));g.add(at(box(0.8,0.5,0.6,'#C8935E'),0.1,0.85,-1.1));return g;}},
  bread:{dx:2.4,dz:-0.6,ry:0,make(){const g=new THREE.Group();g.add(at(box(0.9,0.6,0.7,'#B5793A'),0,0.3,0));for(let i=0;i<4;i++){const b=cmGoodMesh('bread');b.position.set(-0.25+i*0.17,0.62,0);b.rotation.y=Math.PI/2;g.add(b);}return g;}},
  flowers:{dx:0,dz:-2.4,ry:0,make(){const g=new THREE.Group();g.add(at(box(2.2,0.6,1.1,'#6BA3D6'),0,0.75,0));
    for(const s of[-1,1])g.add(rot(at(cyl(0.35,0.35,0.12,'#2B2040',12),1.15*s,0.35,0.3),0,0,Math.PI/2));
    for(let i=0;i<6;i++){const f=cmGoodMesh('flowers');f.scale.setScalar(1.6);f.position.set(-0.85+i*0.34,1.05,Math.sin(i)*0.2);g.add(f);}
    g.add(at(cyl(0.04,0.04,1.3,'#8B5E3C',6,{ol:false}),-0.9,1.3,-0.45));g.add(at(cyl(0.04,0.04,1.3,'#8B5E3C',6,{ol:false}),0.9,1.3,-0.45));
    const aw=mk(new THREE.BoxGeometry(2.4,0.1,1.3),0,{mat:MT(stripeTex('#F15BB5','#FFFFFF',8))});aw.position.set(0,2,0);g.add(aw);return g;}},
  fruit:{dx:1.9,dz:0.6,ry:0,make(){const g=new THREE.Group();g.add(at(box(0.9,0.5,0.7,'#B5793A'),0,0.25,0));for(let i=0;i<5;i++){const f=cmGoodMesh('fruit');f.position.set(-0.28+(i%3)*0.28,0.5+(i>2?0.15:0),(i>2?0.1:-0.1));g.add(f);}return g;}},
  cheese:{dx:0,dz:-2.4,ry:0,make(){const g=new THREE.Group();g.add(at(box(1.9,0.7,1.1,'#FFFFFF'),0,0.8,0));g.add(at(box(1.92,0.2,1.12,'#4D96FF',{ol:false}),0,0.95,0));
    for(const s of[-1,1])g.add(rot(at(cyl(0.35,0.35,0.12,'#2B2040',12),1,0.35,0.35*s+0.1*s),Math.PI/2,0,0));
    for(let i=0;i<3;i++){const c=cmGoodMesh('cheese');c.scale.setScalar(1.8);c.position.set(-0.55+i*0.55,1.17,0);g.add(c);}
    g.add(at(cyl(0.22,0.22,0.6,'#DDE7F0',10),1.3,0.3,-0.7));return g;}},
  teapot:{dx:0,dz:-2.6,ry:0,make(){const g=new THREE.Group();
    g.add(at(cyl(0.9,1.15,1.6,'#C8703F',12),0,0.8,0));g.add(at(cone(0.95,0.9,'#B25A2E',12),0,2.05,0));g.add(at(cyl(0.18,0.2,0.9,'#8A4A2A',8),0,2.7,0));
    g.add(at(box(0.8,0.6,0.1,'#2B2040',{ol:false}),0,0.6,0.98));g.add(at(box(0.6,0.35,0.05,'#FF9F1C',{ol:false,shadow:false}),0,0.55,1.02));
    g.add(at(box(1.8,0.12,0.6,'#8B5E3C'),1.9,0.9,0.6));for(const x of[1.2,2.6])g.add(at(cyl(0.05,0.05,0.9,'#5B3A29',5,{ol:false}),x,0.45,0.6));
    for(let i=0;i<3;i++){const t=cmGoodMesh('teapot');t.scale.setScalar(1.5);t.position.set(1.4+i*0.5,0.96,0.6);g.add(t);}return g;}},
};
function cmBuildSuppliers(){
  for(const [g,sp] of Object.entries(CM_TUNE.SUPPLIERS)){
    const G=CM_TUNE.GOODS[g],pr=CM_PROPS[g];
    const prop=pr.make();const px=sp.x+pr.dx,pz=sp.z+pr.dz;prop.position.set(px,landH(px,pz),pz);prop.rotation.y=pr.ry;CMW.root.add(prop);
    // a footprint the player bumps into and the AI walks round
    const b=new THREE.Box3().setFromObject(prop);CMW.obstacles.push({t:1,x0:b.min.x,x1:b.max.x,z0:b.min.z,z1:b.max.z});
    // signpost beside the spot
    const post=new THREE.Group();post.add(at(cyl(0.07,0.07,2.1,'#8B5E3C',6),0,1.05,0));
    const sign=signBox(`${G.name} · ${G.cost}🪙`,1.8,0.45,'#FFF3D6','#2B2040');sign.position.set(0,1.95,0.1);post.add(sign);
    const sx=sp.x-1.6,sz=sp.z+(pr.dz<0?-0.4:0.9);post.position.set(sx,landH(sx,sz),sz);post.rotation.y=pr.dz<0?0:Math.PI;   // facing away from the prop
    CMW.root.add(post);CMW.obstacles.push({t:0,x:sx,z:sz,r:0.15});
    // the marker: always readable, so you can find your way
    const mark=cmSprite(0.05,false);cmText(mark,`${G.icon} ${G.cost}`,'sign');mark.position.set(sp.x,landH(sp.x,sp.z)+3.4,sp.z);CMW.root.add(mark);
    // the spot itself: a ring on the ground
    const ring=new THREE.Mesh(new THREE.RingGeometry(1.6,1.9,32),new THREE.MeshBasicMaterial({color:0xFFD23F,transparent:true,opacity:0.75,depthWrite:false}));
    ring.rotation.x=-Math.PI/2;ring.position.set(sp.x,groundY(sp.x,sp.z)+0.06,sp.z);ring.renderOrder=2;CMW.root.add(ring);
    CMW.sup[g]={prop,mark,ring};
  }
}

/* ---------- the trading stalls: an owner banner, shelves and price tags ---------- */
function cmBuildStalls(){
  const keys=Object.keys(CM_TUNE.GOODS);
  CM_TUNE.STALLS.forEach((d,i)=>{
    const g=new THREE.Group(),y=landH(d.x,d.z);g.position.set(d.x,y,d.z);CMW.root.add(g);
    const face=d.z<0?1:-1;   // towards the street
    // six goods along the counter; their price tags hang off the front edge (clear of the awning), staggered so neighbours don't overlap
    const slots=keys.map((k,j)=>{const sg=new THREE.Group();sg.position.set((j-(keys.length-1)/2)*0.58*face,0.9,0.3*face);sg.scale.setScalar(1.35);g.add(sg);
      const tag=cmSprite(0.44);tag.position.set(sg.position.x,j%2?1.62:1.2,1.05*face);g.add(tag);tag.visible=false;
      return {k,g:sg,tag,n:-1,price:-1};});
    CMW.stalls.push({g,d,face,slots,banner:null,owner:null});
  });
}
function cmStallBanner(S,name,col){
  if(S.banner){S.g.remove(S.banner);S.banner=null;}
  if(!name)return;
  const b=signBox(name,2.6,0.5,col,'#2B2040');b.position.set(0,2.3,1.05*S.face);if(S.face<0)b.rotation.y=Math.PI;
  S.g.add(b);S.banner=b;
}
function cmSyncStall(S,st){
  if(st.owner!==S.owner){S.owner=st.owner;const p=CMG.s&&CMG.s.players[st.owner];cmStallBanner(S,p?p.name:'',p?p.col:'#FFF');}
  for(const sl of S.slots){
    const n=st.owner?st.stock[sl.k]||0:0,price=st.price[sl.k];
    if(n!==sl.n){sl.n=n;sl.g.clear();
      for(let i=0;i<Math.min(n,3);i++){const m=cmGoodMesh(sl.k);m.position.set(0,i*0.13,-0.18*i*S.face);sl.g.add(m);}}
    sl.tag.visible=n>0;
    if(n>0&&(price!==sl.price||sl.tag.userData.key==='')){sl.price=price;cmText(sl.tag,`${CM_TUNE.GOODS[sl.k].icon}${price}`,'tag');}
  }
}

/* ---------- customers ---------- */
const CM_CLOTHES=['#FF9F1C','#4D96FF','#3DDC97','#9B5DE5','#F15BB5','#2EC4B6','#FF5D73','#B08968','#6B4FC8'];
const CM_HATS=[null,'#2B2040','#FFD23F','#FFFFFF',null,'#FF5D73'];
const CM_SKIN=['#F5C9A0','#E0AC80','#C68A5E','#8D5A3B','#FBD9BC'];
function cmCustMesh(c){
  const k=c.look;const m=npc(CM_CLOTHES[k%CM_CLOTHES.length],CM_HATS[(k>>4)%CM_HATS.length],CM_SKIN[(k>>8)%CM_SKIN.length]);
  const bub=cmSprite(0.62);bub.position.y=2.12;m.add(bub);
  m.position.set(c.x,groundY(c.x,c.z),c.z);CMW.root.add(m);
  return {m,bub,ph:'',face:0,walk:0,mood:''};
}
function cmBubbleFor(c){
  const w=c.want[0],G=CM_TUNE.GOODS[w.item];
  if(c.ph==='think')return [`🤔 ${G.icon}`,'think'];
  if(c.ph==='go')return [`👍 ${G.icon}${c.deal.price}`,'happy'];
  if(c.ph==='buy')return ['🪙','happy'];
  if(c.ph==='leave')return c.happy?['😊','happy']:['😞','sad'];
  return [`${G.icon} ≤${w.max}`,'bubble'];
}

/* ---------- beans: the rivals, and everyone's arms full ---------- */
function cmApron(bean,col){
  const a=box(0.62,0.5,0.06,'#FFFFFF',{w:0.02});a.position.set(0,0.62,bodyR(0.62)+0.01);a.rotation.x=-0.12;
  a.add(at(box(0.3,0.16,0.02,col,{ol:false,shadow:false}),0,-0.05,0.04));bean.userData.body.add(a);
}
function cmCrate(){
  const g=new THREE.Group();g.add(at(box(0.62,0.3,0.4,'#C8935E',{w:0.025}),0,0,0));g.userData.items=new THREE.Group();g.userData.items.position.y=0.15;g.add(g.userData.items);g.userData.key=null;g.visible=false;return g;
}
function cmFillCrate(cr,carry){
  const list=[];for(const [k,n] of Object.entries(carry))for(let i=0;i<n;i++)list.push(k);
  const key=list.join(',');if(cr.userData.key===key)return;cr.userData.key=key;
  const it=cr.userData.items;it.clear();
  list.slice(0,6).forEach((k,i)=>{const m=cmGoodMesh(k);m.scale.setScalar(0.8);m.position.set(((i%3)-1)*0.18,Math.floor(i/3)*0.12,(Math.floor(i/3)?0.06:-0.06));it.add(m);});
  cr.visible=list.length>0;
}
// arms out front holding the crate (after animBean has posed them)
function cmHoldPose(bean){const a=bean.userData.arms;a[0].rotation.set(-1.25,0,-0.35);a[1].rotation.set(-1.25,0,0.35);}
function cmBean(p){
  const b=makeBean(p.col,DEFAULT_FIT,p.name);cmApron(b,p.col);
  const cr=cmCrate();cr.position.set(0,0.95,0.55);b.userData.rig.add(cr);cr.visible=false;
  const say=cmSprite(0.5);say.position.y=2.95;say.visible=false;b.add(say);
  b.position.set(p.x,groundY(p.x,p.z),p.z);CMW.root.add(b);
  return {b,cr,say,sayT:0,face:0,px:p.x,pz:p.z};
}

/* ---------- build, show, tear down ---------- */
function cmWorldBuild(){
  if(!CMW.built){
    CMW.root=new THREE.Group();scene.add(CMW.root);
    cmBuildSuppliers();cmBuildStalls();
    CMW.ring=new THREE.Mesh(new THREE.RingGeometry(0.55,0.75,24),new THREE.MeshBasicMaterial({color:0xFFD23F,depthWrite:false,transparent:true,opacity:0.9}));
    CMW.ring.rotation.x=-Math.PI/2;CMW.ring.renderOrder=3;CMW.ring.visible=false;CMW.root.add(CMW.ring);
    CMW.built=true;
  }
  CMW.root.visible=true;
  // the decorations on the four trading stalls make way for real stock
  CMW.hidden=[];
  for(const o of W.list){if(o.k==='stall'||o.mv)continue;const p=o.obj.position;
    if(CM_TUNE.STALLS.some(d=>Math.abs(p.x-d.x)<2.2&&Math.abs(p.z-d.z)<1.3)){o.obj.userData.cmHidden=true;o.obj.visible=false;CMW.hidden.push(o);}}
  for(const ob of CMW.obstacles)W.obstacles.push(ob);
  if(!CMW.grid)CMW.grid=cmNavGrid();
}
function cmWorldClear(){
  if(!CMW.built)return;
  CMW.root.visible=false;
  for(const o of CMW.hidden){delete o.obj.userData.cmHidden;o.obj.visible=true;}CMW.hidden=[];
  for(const ob of CMW.obstacles){const i=W.obstacles.indexOf(ob);if(i>=0)W.obstacles.splice(i,1);}
  for(const c of CMW.cust.values())CMW.root.remove(c.m);CMW.cust.clear();
  for(const b of CMW.beans.values())CMW.root.remove(b.b);CMW.beans.clear();
  for(const S of CMW.stalls){cmStallBanner(S,'');S.owner=null;for(const sl of S.slots){sl.n=-1;sl.price=-1;sl.g.clear();sl.tag.visible=false;}}
  if(CMW.carry&&P.bean)P.bean.userData.rig.remove(CMW.carry);CMW.carry=null;
  CMW.ring.visible=false;
}
// where a bean can stand, as a grid the AI plans its walks on (built once, ~1 m cells)
function cmNavGrid(){
  const R=0.6,obs=W.obstacles;
  const blocked=(x,z)=>{
    if(!walkable(x,z))return true;
    for(const o of obs){
      if(o.t===0){if(Math.abs(x-o.x)<o.r+R&&Math.abs(z-o.z)<o.r+R&&Math.hypot(x-o.x,z-o.z)<o.r+R)return true;}
      else if(x>o.x0-R&&x<o.x1+R&&z>o.z0-R&&z<o.z1+R)return true;
    }
    return false;
  };
  return CMNav.makeGrid(-70,-75,210,150,1,blocked);
}

/* ---------- every frame: draw the state ---------- */
function cmWorldSync(s,dt,ts,target){
  for(let i=0;i<CMW.stalls.length;i++)cmSyncStall(CMW.stalls[i],s.stalls[i]);
  // customers
  const seen=new Set();
  for(const c of s.cust){
    seen.add(c.id);let v=CMW.cust.get(c.id);if(!v){v=cmCustMesh(c);CMW.cust.set(c.id,v);}
    const m=v.m,k=damp(10,dt),ox=m.position.x,oz=m.position.z;
    m.position.x=lerp(m.position.x,c.x,k);m.position.z=lerp(m.position.z,c.z,k);
    const vx=m.position.x-ox,vz=m.position.z-oz,moving=Math.hypot(vx,vz)>0.004;
    if(moving)v.face=Math.atan2(vx,vz);
    else if(c.ph==='buy'||c.ph==='think'){const st=c.deal?s.stalls[c.deal.stall]:null;if(st)v.face=Math.atan2(st.x-c.x,st.z-c.z);}
    m.rotation.y=angLerp(m.rotation.y,v.face,damp(8,dt));
    if(moving)v.walk+=dt*9;
    m.position.y=groundY(m.position.x,m.position.z)+(moving?Math.abs(Math.sin(v.walk))*0.06:0);
    const sw=moving?Math.sin(v.walk)*0.6:0;m.userData.arms[0].rotation.x=sw;m.userData.arms[1].rotation.x=-sw;
    const [txt,sty]=cmBubbleFor(c);cmText(v.bub,txt,sty);
  }
  for(const [id,v] of CMW.cust)if(!seen.has(id)){CMW.root.remove(v.m);CMW.cust.delete(id);}
  // the customer E would pitch
  if(target&&CMW.cust.get(target)){const m=CMW.cust.get(target).m;CMW.ring.visible=true;CMW.ring.position.set(m.position.x,groundY(m.position.x,m.position.z)+0.07,m.position.z);CMW.ring.scale.setScalar(1+0.08*Math.sin(ts*6));}
  else CMW.ring.visible=false;
  // rivals
  for(const id of s.order){
    const p=s.players[id];if(!p.ai)continue;
    let v=CMW.beans.get(id);if(!v){v=cmBean(p);CMW.beans.set(id,v);}
    const b=v.b,k=damp(14,dt),ox=b.position.x,oz=b.position.z;
    b.position.x=lerp(b.position.x,p.x,k);b.position.z=lerp(b.position.z,p.z,k);b.position.y=groundY(b.position.x,b.position.z);
    const sp=Math.hypot(b.position.x-ox,b.position.z-oz)/Math.max(dt,1e-3);
    if(sp>0.5)v.face=Math.atan2(b.position.x-ox,b.position.z-oz);
    else{const st=s.stalls[p.stall];if(Math.hypot(p.x-st.x,p.z-st.z)<4)v.face=angLerp(v.face,st.z<0?0:Math.PI,damp(3,dt));}
    b.rotation.y=angLerp(b.rotation.y,v.face,damp(12,dt));
    animBean(b,{an:sp>9?2:sp>0.5?1:0,hb:false},ts);
    cmFillCrate(v.cr,p.carry);if(v.cr.visible)cmHoldPose(b);
    if(v.sayT>0){v.sayT-=dt;if(v.sayT<=0)v.say.visible=false;}
  }
  // your own arms
  if(P.bean){
    if(!CMW.carry||CMW.carry.parent!==P.bean.userData.rig){CMW.carry=cmCrate();CMW.carry.position.set(0,0.95,0.55);P.bean.userData.rig.add(CMW.carry);}
    const me=s.players[CMG.me];cmFillCrate(CMW.carry,me?me.carry:{});if(CMW.carry.visible)cmHoldPose(P.bean);
  }
}
function cmSay(id,text){const v=CMW.beans.get(id);if(!v)return;cmText(v.say,text,'say');v.say.visible=true;v.sayT=3.2;}
