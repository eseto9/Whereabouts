/* =========================================================
   Placement helpers, then the Farm and the Orchard
   ========================================================= */
W.spots=[];      // where decorations already sit (spacing only, they don't block walking)
function onRoad(x,z){
  const r=Math.hypot(x,z);
  if(Math.abs(r-26)<3.6)return true;                                 // ring road
  if(x>12&&x<58&&Math.abs(z)<4.6)return true;                         // Market Street
  if(Math.abs(x)<3.2&&((z>12&&z<51)||(z<-12&&z>-37)))return true;     // north and south roads
  if(z>-3.2&&z<3.2&&x<-12&&x>-31)return true;                         // park road
  if(x>55&&x<106&&Math.abs(z)<3.2)return true;                        // farm lane
  if(Math.abs(x-75)<1.8&&z>0&&z<11.5)return true;                      // track up to the farm gate
  return false;
}
function blocked(x,z,r,roads){
  if(edgeDist(x,z)<8)return true;
  if(roads&&onRoad(x,z))return true;
  for(const o of W.obstacles){
    if(o.t===0){if(Math.hypot(x-o.x,z-o.z)<o.r+r+0.35)return true;}
    else{const cx=clamp(x,o.x0,o.x1),cz=clamp(z,o.z0,o.z1);if(Math.hypot(x-cx,z-cz)<r+0.35)return true;}
  }
  for(const s of W.spots)if(Math.hypot(x-s.x,z-s.z)<s.r+r+0.25)return true;
  return false;
}
// the nearest free spot to (x,z), spiralling outwards; deterministic, so every player's town matches
function freeSpot(x,z,r,roads){
  for(let k=0;k<500;k++){const a=k*2.39996,d=k?0.4*Math.sqrt(k):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(!blocked(px,pz,r,roads))return [px,pz];}
  return [x,z];
}
// put a thing on the ground near (x,z): solid things block walking, the rest only keep their distance
function place(g,x,z,r,meta,o){
  o=o||{};const [px,pz]=o.exact?[x,z]:freeSpot(x,z,r,o.solid!==false);
  (W.placeLog||(W.placeLog=[])).push({n:meta.n,moved:Math.hypot(px-x,pz-z)});
  onGround(g,px,pz,o.y||0);if(o.ry!=null)g.rotation.y=o.ry;
  F(g,meta);
  if(o.solid===false)W.spots.push({x:px,z:pz,r});else circ(px,pz,r);
  return g;
}
// the farm and orchard live out on the eastern headland: their layouts were drawn at a smaller
// size, these spread them out over the new land
const FX=x=>64+(x-29)*1.4,FZ=z=>10+(z-14)*1.35;
const OX=x=>66+(x-31)*2,OZ=z=>-6+(z+16)*1.9,GATE=[72,-5.4];
const G_=(...kids)=>{const g=new THREE.Group();for(const k of kids)g.add(k);return g;};

function fruitTree(x,z,leaf,fruit,meta,o){
  const g=new THREE.Group();
  g.add(at(cyl(0.2,0.3,1.8,'#8B5E3C',7),0,0.9,0));
  g.add(at(sph(1.35,leaf[0],8,6),0,2.7,0));g.add(at(sph(1,leaf[1],7,5),0.85,2.3,0.35));g.add(at(sph(0.95,leaf[2]||leaf[0],7,5),-0.75,2.4,-0.4));
  const fr=[[0.9,2.6,0.9],[-0.6,2.1,0.9],[0.3,3.3,0.9],[1.3,2.2,-0.2],[-1.1,2.8,0.1],[0.2,2.0,-1.1],[-0.4,3.2,-0.8]];
  for(const [fx,fy,fz] of fr)g.add(at(sph(0.14,fruit,6,5,{w:0.02}),fx,fy,fz));
  place(g,x,z,0.6,meta,o);g.updateMatrixWorld(true);
  return g;
}
// a world position on a placed object, e.g. a branch of a tree
const worldAt=(obj,x,y,z)=>{obj.updateMatrixWorld(true);return obj.localToWorld(new V3(x,y,z));};

function dirtTex(){
  const t=canvasTex(64,128,(x,W,H)=>{x.fillStyle='#D9B98A';x.fillRect(0,0,W,H);
    for(let i=0;i<70;i++){x.fillStyle=i%3?'#C9A677':'#E6CCA2';x.beginPath();x.arc(srand()*W,srand()*H,1+srand()*2.2,0,TAU);x.fill();}
    x.fillStyle='#B8966A';x.fillRect(14,0,5,H);x.fillRect(W-19,0,5,H);x.fillStyle='#8FC96A';x.fillRect(0,0,3,H);x.fillRect(W-3,0,3,H);});
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
function buildFarm(){
  // Farm Lane: Market Street runs on as a dirt lane out to the countryside
  {const m=MT(dirtTex());
   ribbon(dense([[56.6,0],[70,0.6],[86,-0.4],[104,0.3]],1.5),5,m,false,0.045);
   ribbon(dense([[75,2.4],[75,6],[75.3,11.5]],1),3,m,false,0.05);}
  // fence around the farmyard (scenery)
  {const g=new THREE.Group();const x0=FX(29),x1=FX(49),z0=FZ(15),z1=FZ(29);const rail='#E8D5B5';
   const side=(ax,az,bx,bz)=>{const L=Math.hypot(bx-ax,bz-az),a=Math.atan2(bz-az,bx-ax);
     for(const y of[0.45,0.9]){const b=box(L,0.1,0.08,rail,{ol:false});b.position.set((ax+bx)/2,y,(az+bz)/2);b.rotation.y=-a;g.add(b);}
     const n=Math.ceil(L/3);for(let i=0;i<=n;i++){const p=cyl(0.07,0.07,1.1,'#B08968',5,{ol:false});p.position.set(lerp(ax,bx,i/n),0.55,lerp(az,bz,i/n));g.add(p);}};
   side(x0,z0,x0,z1-5);side(x0,z1,x1,z1);side(x1,z0,x1,z1);side(x0,z0,FX(35),z0);side(FX(39),z0,x1,z0);
   g.position.y=landH(FX(39),FZ(22));scene.add(g);F(g,{k:'fence',n:'a fence',c:['cream'],s:'long',m:'wood',p:false});}
  {const t=signBox('Sunny Side Up Farm',3.4,0.8,'#FFD23F','#2B2040');const g=G_(at(box(0.16,1.8,0.16,'#8B5E3C'),-1.4,0.9,0),at(box(0.16,1.8,0.16,'#8B5E3C'),1.4,0.9,0));t.position.y=1.9;g.add(t);
   place(g,FX(34),FZ(14.2),0.6,{k:'sign',n:'the farm sign',c:['yellow'],s:'flat',m:'wood',v:'sunny and friendly',u:'find the farm with',e:'🪧🌻🚜',r:['I stand at the gate and tell you the farm’s sunny name.']},{exact:true,ry:Math.PI});}

  // the red barn, with a weather vane and a lucky horseshoe
  let barn;
  {const g=new THREE.Group();
   g.add(at(box(6,4.4,5.2,'#D9534F'),0,2.2,0));
   const r=mk(prismGeo(6.6,2.6,5.8),'#7A2E2E');r.position.y=4.4;g.add(r);
   g.add(at(box(2.4,2.8,0.2,'#FFFFFF',{w:0.03}),0,1.4,2.62));
   for(const s of[-1,1])g.add(rot(at(box(0.18,3.3,0.22,'#FFFFFF',{ol:false}),0,1.4,2.75),0,0,s*0.7));
   g.add(at(box(1.2,1,0.2,'#FFFFFF',{w:0.03}),0,4.6,2.62));
   barn=place(g,FX(40),FZ(23),3.3,{k:'barn',n:'the red barn',c:['red','white'],s:'boxy',m:'wood',v:'cozy and a bit smelly',snd:'moo (from inside)',u:'store hay in',e:'🐄🏚️🌾',
     r:['I’m big and red with a pointy roof, and I smell like hay.','Cows sleep inside me and hay hides up in my loft.']},{exact:true,ry:Math.PI});
   rect(FX(40),FZ(23),6.2,5.4);}
  {const v=new THREE.Group();v.add(at(cyl(0.04,0.04,1.2,'#2B2040',5,{ol:false}),0,0.6,0));
   const bird=G_(scl(at(sph(0.22,'#2B2040',8,6,{ol:false}),0,0,0),1.4,0.8,0.4),at(cone(0.1,0.3,'#2B2040',4,{ol:false}),0.3,0.15,0));bird.position.y=1.25;v.add(bird);
   v.position.set(FX(40),landH(FX(40),FZ(23))+7,FZ(23));scene.add(v);
   F(v,{k:'weather vane',n:'the weather vane',c:['black'],s:'pointy',m:'iron',v:'always changing its mind',u:'check the wind with',e:'🐓💨🧭',r:['I sit on the barn roof and point wherever the wind blows.'],mv:true});
   W.movers.push(t=>{bird.rotation.y=Math.sin(t*0.3)*1.5+Math.sin(t*1.7)*0.2;});}
  {const h=mk(new THREE.TorusGeometry(0.22,0.05,5,10,Math.PI*1.4),'#B8B8C8',{w:0.015});h.rotation.set(0,Math.PI,Math.PI*0.8);
   h.position.set(FX(40),landH(FX(40),FZ(23))+3.3,FZ(23)-2.72);scene.add(h);
   F(h,{k:'horseshoe',n:'the lucky horseshoe',c:['silver'],s:'curved',m:'iron',v:'feeling lucky',u:'hang up for good luck',e:'🐴🍀👟',r:['A horse once wore me on its foot; now I hang over the barn door for luck.']});}

  // grain silo
  {const g=G_(at(cyl(1.3,1.3,7,'#A8B8C8',14),0,3.5,0),at(sph(1.32,'#8FA3B8',14,8),0,7,0));
   for(let i=0;i<4;i++)g.add(at(cyl(1.33,1.33,0.08,'#7B8AA0',14,{ol:false}),0,1.2+i*1.6,0));
   place(g,FX(45.5),FZ(25),1.4,{k:'silo',n:'the grain silo',c:['silver','blue'],s:'tall and round',m:'metal',v:'standing to attention',u:'store grain in',e:'🌾🗼🥫',
     r:['I’m a giant tin can full of grain, standing next to the barn.']},{exact:true});}
  // farmhouse
  house(FX(32.5),FZ(25.5),'#FFFFFF','#3E9E4A',{k:'farmhouse',n:'the farmhouse',c:['white','green'],s:'boxy',m:'wood',v:'homely',snd:'creak',u:'have breakfast in',e:'🏡🥞🐓',
    r:['The farmer sleeps in me and wakes up before the rooster.']});
  {const b=G_(at(box(0.22,0.35,0.35,'#FFD23F',{w:0.015}),-0.14,0.17,0),at(box(0.22,0.35,0.35,'#FFD23F',{w:0.015}),0.14,0.17,0));
   place(b,FX(30.4),FZ(22.4),0.3,{k:'boots',n:'the rubber boots',c:['yellow'],s:'tall',m:'rubber',v:'ready for puddles',u:'stomp through mud in',e:'👢🌧️🐷',r:['Two of us wait by the door for a muddy day.']},{solid:false});}

  // tractor
  {const g=new THREE.Group();
   g.add(at(box(1.4,0.9,2.2,'#3E9E4A'),0,1.1,0.1));g.add(at(box(1.3,1.1,1,'#3E9E4A'),0,1.9,-0.4));g.add(at(box(1.2,0.08,1.05,'#FFD23F',{w:0.02}),0,2.5,-0.4));
   for(const s of[-1,1]){g.add(rot(at(cyl(0.8,0.8,0.45,'#2B2040',14),0.95*s,0.8,-0.5),0,0,Math.PI/2));g.add(rot(at(cyl(0.45,0.45,0.3,'#FFD23F',12,{ol:false}),0.96*s,0.8,-0.5),0,0,Math.PI/2));
     g.add(rot(at(cyl(0.42,0.42,0.3,'#2B2040',12),0.85*s,0.42,1.1),0,0,Math.PI/2));}
   g.add(at(cyl(0.07,0.07,0.9,'#555',6,{ol:false}),0.4,2,0.8));
   place(g,FX(36),FZ(18.5),1.4,{k:'tractor',n:'the green tractor',c:['green','yellow'],s:'chunky',m:'metal',v:'hardworking',snd:'putt-putt',u:'plough a field with',e:'🚜🌱💪',
     r:['I have two giant back wheels and two tiny front ones, and I plough all day.']},{exact:true,ry:0.6});}
  // hay bales
  {const g=new THREE.Group();const hay='#E8C45A';
   for(const [x,y,z] of[[-0.8,0.6,0],[0.8,0.6,0],[0,1.65,0]]){const b=rot(at(cyl(0.6,0.6,1.4,hay,12),x,y,z),Math.PI/2,0,0);g.add(b);g.add(rot(at(cyl(0.3,0.3,1.42,'#D4AE45',10,{ol:false}),x,y,z),Math.PI/2,0,0));}
   place(g,FX(31.5),FZ(17.5),1.4,{k:'hay bales',n:'the hay bales',c:['yellow','gold'],s:'round',m:'hay',v:'a bit scratchy',u:'feed the cows with',e:'🌾🧻🐄',r:['I’m dried grass rolled up tight, waiting for winter.']},{exact:true});}
  // wishing well
  {const g=new THREE.Group();g.add(at(cyl(0.85,0.9,0.9,'#B8B2C8',12),0,0.45,0));g.add(at(mk(new THREE.CylinderGeometry(0.7,0.7,0.05,12),'#3B6E8C',{ol:false}),0,0.82,0));
   for(const s of[-1,1])g.add(at(box(0.12,1.6,0.12,'#8B5E3C'),0.8*s,1.5,0));
   g.add(rot(at(cone(1.25,0.7,'#7A2E2E',4),0,2.55,0),0,Math.PI/4,0));g.add(rot(at(cyl(0.06,0.06,1.7,'#8B5E3C',5,{ol:false}),0,1.9,0),0,0,Math.PI/2));
   g.add(at(cyl(0.16,0.13,0.25,'#8B5E3C',8,{w:0.02}),0.1,1.4,0));
   place(g,FX(46.5),FZ(20),1,{k:'well',n:'the wishing well',c:['grey','red'],s:'round',m:'stone',v:'full of wishes',snd:'plink',u:'drop a coin into',e:'🪣🌟🪙',r:['Drop a coin into me and make a wish, but don’t fall in!']},{exact:true});}
  // chicken coop
  {const g=new THREE.Group();for(const sx of[-0.7,0.7])for(const sz of[-0.5,0.5])g.add(at(box(0.1,0.7,0.1,'#8B5E3C',{ol:false}),sx,0.35,sz));
   g.add(at(box(1.8,1.1,1.4,'#F2C57C'),0,1.25,0));const r=mk(prismGeo(2,0.8,1.6),'#D9534F');r.position.y=1.8;g.add(r);
   g.add(at(box(0.5,0.5,0.1,'#2B2040',{ol:false}),0,1.2,0.71));const ramp=box(0.5,0.05,1.2,'#B08968',{w:0.02});ramp.position.set(0,0.4,1.1);ramp.rotation.x=0.5;g.add(ramp);
   place(g,FX(43),FZ(17.5),1.2,{k:'coop',n:'the chicken coop',c:['tan','red'],s:'boxy',m:'wood',v:'full of gossip',snd:'cluck-cluck',u:'collect eggs from',e:'🐔🏠🥚',r:['Hens sleep in me and leave surprises behind in the morning.']},{exact:true});}
  // windpump
  {const g=new THREE.Group();for(const [sx,sz] of[[-1,-1],[1,-1],[-1,1],[1,1]])g.add(rot(at(cyl(0.05,0.05,6,'#8FA3B8',4,{ol:false}),sx*0.45,3,sz*0.45),sz*0.08,0,-sx*0.08));
   const fan=new THREE.Group();fan.position.set(0,6.1,0.35);for(let i=0;i<12;i++){const b=box(0.14,1.1,0.03,'#C8D4E0',{ol:false});b.position.y=0.6;const p=new THREE.Group();p.add(b);p.rotation.z=i/12*TAU;fan.add(p);}
   fan.add(at(sph(0.15,'#2B2040',6,5,{ol:false}),0,0,0));g.add(fan);g.add(rot(at(box(0.05,0.6,1.2,'#D9534F',{ol:false}),0,6.1,-0.6),0,0,0));
   place(g,FX(47),FZ(26),0.8,{k:'windpump',n:'the windpump',c:['silver','red'],s:'tall',m:'metal',v:'spinning its heart out',snd:'clank-clank',u:'pump water with',e:'🌬️💧🌀',r:['My metal flower spins in the wind to pull water up from the ground.']},{exact:true});
   W.movers.push(t=>{fan.rotation.z=-t*2.2;});}
  // greenhouse with tomatoes
  {const g=new THREE.Group();const glass=new THREE.MeshToonMaterial({color:'#CFF4FF',transparent:true,opacity:0.45,gradientMap:gradTex,depthWrite:false});
   const bx=new THREE.Mesh(new THREE.BoxGeometry(3.6,2,2.4),glass);bx.position.y=1;outline(bx,0.04);g.add(bx);
   const rf=new THREE.Mesh(prismGeo(3.8,1,2.6),glass);rf.position.y=2;outline(rf,0.04);g.add(rf);
   for(let i=0;i<5;i++){g.add(at(cyl(0.05,0.05,1,'#3E9E4A',4,{ol:false}),-1.3+i*0.65,0.5,0));g.add(at(sph(0.12,'#E8323F',6,5,{ol:false}),-1.3+i*0.65,0.8,0.12));}
   place(g,FX(36),FZ(26.5),2,{k:'greenhouse',n:'the greenhouse',c:['clear','green'],s:'boxy',m:'glass',v:'warm and steamy',u:'grow tomatoes in',e:'🍅🏠🌡️',r:['I’m a little glass house where tomatoes stay warm all winter.']},{exact:true});}
  // water trough and milk churn
  {const g=G_(at(box(2,0.6,0.7,'#8FA3B8'),0,0.3,0),at(mk(new THREE.BoxGeometry(1.8,0.05,0.5),'#5FB6D6',{ol:false}),0,0.58,0));
   place(g,FX(38),FZ(16.5),1,{k:'trough',n:'the water trough',c:['grey','blue'],s:'long',m:'metal',v:'always refreshing',snd:'slurp',u:'give the animals a drink from',e:'🐄💧🥤',r:['Thirsty animals drink from my long metal tub.']},{solid:false});}
  {const g=G_(at(cyl(0.22,0.26,0.6,'#C8D4E0',10),0,0.3,0),at(cyl(0.14,0.2,0.2,'#C8D4E0',10),0,0.7,0),at(cyl(0.16,0.16,0.06,'#8FA3B8',10,{ol:false}),0,0.82,0));
   place(g,FX(35.2),FZ(21),0.3,{k:'churn',n:'the milk churn',c:['silver'],s:'tall and round',m:'metal',v:'full to the brim',u:'carry fresh milk in',e:'🥛🥫🐄',r:['I’m a tall metal can full of fresh milk from the cow.']},{solid:false});}
  // pitchfork leaning on the barn, wheelbarrow, watering can
  {const g=new THREE.Group();g.add(at(cyl(0.035,0.035,1.7,'#B08968',5,{ol:false}),0,0.85,0));g.add(at(box(0.4,0.05,0.05,'#8FA3B8',{ol:false}),0,1.72,0));
   for(const x of[-0.18,0,0.18])g.add(at(cone(0.03,0.35,'#8FA3B8',4,{ol:false}),x,1.9,0));g.rotation.x=0.2;
   place(g,FX(37.6),FZ(20.2),0.2,{k:'pitchfork',n:'the pitchfork',c:['silver','brown'],s:'long and pointy',m:'metal',v:'a bit prickly',u:'toss hay with',e:'🔱🌾😬',r:['I have three sharp teeth and I toss hay all day.']},{solid:false});}
  {const g=new THREE.Group();const tub=mk(new THREE.CylinderGeometry(0.55,0.35,0.45,4,1),'#D9534F');tub.rotation.y=Math.PI/4;tub.position.set(0,0.55,0);g.add(tub);
   g.add(rot(at(cyl(0.2,0.2,0.08,'#2B2040',10),0,0.2,0.55),0,0,Math.PI/2));for(const s of[-1,1])g.add(rot(at(cyl(0.03,0.03,1,'#8B5E3C',5,{ol:false}),0.28*s,0.55,-0.5),1.3,0,0));
   place(g,FX(44),FZ(21.5),0.6,{k:'wheelbarrow',n:'the wheelbarrow',c:['red'],s:'tippy',m:'metal',v:'always helpful',snd:'squeak',u:'carry heavy loads in',e:'🛞🪨💪',r:['I have one wheel and two handles, and I carry heavy loads.']},{solid:false});}
  {const g=G_(at(cyl(0.2,0.24,0.35,'#3DDC97',10,{w:0.02}),0,0.18,0),rot(at(cyl(0.03,0.05,0.5,'#3DDC97',6,{ol:false}),0.3,0.35,0),0,0,-0.9),rot(at(mk(new THREE.TorusGeometry(0.15,0.03,4,8,Math.PI),'#3DDC97',{ol:false}),0,0.4,0),0,Math.PI/2,0));
   place(g,FX(47.5),FZ(17),0.3,{k:'watering can',n:'the watering can',c:['green'],s:'spouty',m:'metal',v:'generous',snd:'sprinkle',u:'water the veggies with',e:'💧🌱🚿',r:['I have a long spout and give thirsty plants a drink.']},{solid:false});}
  // vegetable rows: carrots, cabbages, corn, and the scarecrow keeping watch
  {const g=new THREE.Group();for(let i=0;i<6;i++){g.add(at(cone(0.06,0.25,'#FF8C1A',5,{ol:false}),i*0.35-0.9,0.06,0));g.add(at(cone(0.1,0.3,'#4CB85A',5,{ol:false}),i*0.35-0.9,0.3,0));}
   g.add(at(box(2.4,0.12,0.5,'#7A5230',{ol:false}),0,0.02,0));
   place(g,FX(45),FZ(16.5),1,{k:'carrots',n:'the carrot patch',c:['orange','green'],s:'pointy',m:'veg',v:'crunchy and proud',snd:'crunch',u:'feed a rabbit from',e:'🥕🐰👀',r:['We grow upside down: orange underground, green leaves on top.']},{solid:false});}
  {const g=new THREE.Group();for(let i=0;i<4;i++)g.add(at(scl(sph(0.28,i%2?'#6CC05A':'#8AD65E',8,6,{w:0.02}),1,0.8,1),i*0.7-1,0.22,0));
   place(g,FX(45),FZ(19),1,{k:'cabbages',n:'the cabbages',c:['green'],s:'round',m:'leaves',v:'leafy and layered',u:'make coleslaw from',e:'🥬🐛🥗',r:['I’m a ball of leaves inside leaves inside leaves.']},{solid:false});}
  {const g=new THREE.Group();for(let i=0;i<5;i++){g.add(at(cyl(0.05,0.06,1.7,'#6CC05A',5,{ol:false}),i*0.4-0.8,0.85,0));g.add(at(scl(sph(0.1,'#FFD23F',6,5,{ol:false}),1,2.2,1),i*0.4-0.72,1.1,0.05));}
   place(g,FX(47.5),FZ(23),0.8,{k:'corn',n:'the corn stalks',c:['green','yellow'],s:'tall and skinny',m:'plant',v:'all ears',snd:'rustle',u:'make popcorn from',e:'🌽🍿📏',r:['I grow tall, and my yellow cobs hide in green jackets.']},{solid:false});}
  {const g=new THREE.Group();g.add(at(cyl(0.06,0.06,2.2,'#8B5E3C',5,{ol:false}),0,1.1,0));g.add(rot(at(cyl(0.05,0.05,1.8,'#8B5E3C',5,{ol:false}),0,1.6,0),0,0,Math.PI/2));
   g.add(at(box(0.7,0.8,0.35,'#4D96FF'),0,1.4,0));for(const s of[-1,1])g.add(at(box(0.7,0.25,0.3,'#4D96FF',{w:0.02}),0.6*s,1.62,0));
   g.add(at(sph(0.3,'#F2CD7E',8,6),0,2.05,0));g.add(at(cyl(0.55,0.55,0.06,'#E8C45A',10),0,2.3,0));g.add(at(cone(0.3,0.35,'#E8C45A',8),0,2.48,0));
   for(const s of[-1,1])g.add(at(sph(0.05,'#2B2040',4,3,{ol:false,shadow:false}),0.1*s,2.1,0.27));
   place(g,FX(46.5),FZ(18.2),0.4,{k:'scarecrow',n:'the scarecrow',c:['blue','straw'],s:'tall',m:'straw',v:'not very scary',u:'keep crows off the corn with',e:'🧑‍🌾🐦‍⬛🌽',r:['I stand in the field with my arms out, but the crows aren’t scared of me.']});}
  // eggs
  {const g=G_(at(cyl(0.3,0.22,0.22,'#B08968',10,{w:0.02}),0,0.11,0),rot(at(mk(new THREE.TorusGeometry(0.26,0.025,4,10,Math.PI),'#8B5E3C',{ol:false}),0,0.22,0),0,0,0));
   for(const [x,z] of[[-0.1,0],[0.1,0.05],[0,-0.1]])g.add(at(scl(sph(0.08,'#FFF7E6',6,5,{ol:false}),1,1.3,1),x,0.26,z));
   place(g,FX(42.5),FZ(19.8),0.3,{k:'eggs',n:'the basket of eggs',c:['white','brown'],s:'round',m:'shell',v:'fragile',u:'make breakfast with',e:'🥚🧺🍳',r:['Handle me carefully or I’ll crack.']},{solid:false});}

  // animals
  const cowMesh=()=>{const g=new THREE.Group();g.add(scl(at(sph(0.6,'#FFFFFF',10,8),0,0.95,0),0.9,0.8,1.5));
    for(const [x,y,z] of[[0.3,1.1,0.3],[-0.35,0.95,-0.35],[0.2,0.8,-0.6]])g.add(at(scl(sph(0.22,'#2B2040',6,4,{ol:false}),1,0.6,1.2),x,y,z));
    g.add(at(scl(sph(0.35,'#FFFFFF',8,6),0.9,0.9,1.1),0,1.25,0.9));g.add(at(scl(sph(0.22,'#FFB3C7',6,5,{ol:false}),1.2,0.7,0.7),0,1.12,1.18));
    for(const s of[-1,1]){g.add(rot(at(cone(0.05,0.25,'#F2E6C9',5,{ol:false}),0.2*s,1.58,0.85),0,0,-0.6*s));g.add(at(sph(0.05,'#1D1533',4,3,{ol:false,shadow:false}),0.16*s,1.35,1.18));}
    for(const s of[-1,1])for(const f of[-1,1])g.add(at(cyl(0.09,0.09,0.6,'#FFFFFF',6,{w:0.02}),0.28*s,0.3,0.5*f));return g;};
  {const c=cowMesh();scene.add(c);
   F(c,{k:'cow',n:'the spotted cow',c:['black','white'],s:'big and round',m:'fur',v:'utterly relaxed',snd:'moo',u:'get milk from',e:'🐄🥛🌿',r:['I have spots, I say moo, and I make the milk for your cereal.'],mv:true});
   W.movers.push(t=>{const a=t*0.04;const x=FX(36.5)+Math.cos(a)*3.6,z=FZ(19.5)+Math.sin(a)*2.2;c.position.set(x,landH(x,z),z);c.rotation.y=-a;c.children[3].position.y=1.25-Math.max(0,Math.sin(t*0.5))*0.35;});}
  {const g=new THREE.Group();g.add(at(scl(mk(new THREE.CylinderGeometry(1.2,1.2,0.05,14),'#7A5230',{ol:false}),1,1,0.7),0,0.02,0));
   const pig=new THREE.Group();pig.add(scl(at(sph(0.42,'#FFB3C7',10,8),0,0.4,0),1,0.85,1.3));pig.add(at(scl(sph(0.16,'#FF8FA8',6,5,{ol:false}),1,0.8,0.5),0,0.45,0.55));
   for(const s of[-1,1]){pig.add(rot(at(cone(0.08,0.15,'#FFB3C7',4,{ol:false}),0.18*s,0.75,0.3),0,0,-0.4*s));pig.add(at(sph(0.04,'#1D1533',4,3,{ol:false,shadow:false}),0.1*s,0.6,0.46));}
   pig.add(at(scl(sph(0.2,'#7A5230',6,4,{ol:false}),1.6,0.4,1.4),0.1,0.35,-0.1));g.add(pig);
   place(g,FX(32.5),FZ(20.5),0.9,{k:'pig',n:'the muddy pig',c:['pink','brown'],s:'round',m:'skin',v:'happily filthy',snd:'oink',u:'give a belly rub',e:'🐷🟤😌',r:['I love rolling in mud, and my tail is curly.']},{solid:false});
   W.movers.push(t=>{pig.rotation.z=Math.sin(t*0.8)*0.15;});}
  const woolly=()=>{const g=new THREE.Group();for(const [x,y,z] of[[0,0.65,0],[0.25,0.7,0.25],[-0.25,0.7,0.25],[0.25,0.7,-0.25],[-0.25,0.7,-0.25],[0,0.85,0]])g.add(at(sph(0.3,'#FFFFFF',7,5,{w:0.02}),x,y,z));
    g.add(at(scl(sph(0.18,'#2B2040',6,5,{ol:false}),0.9,1,1.2),0,0.72,0.5));for(const s of[-1,1])for(const f of[-1,1])g.add(at(cyl(0.05,0.05,0.4,'#2B2040',4,{ol:false}),0.18*s,0.2,0.22*f));return g;};
  {const s=woolly();scene.add(s);
   F(s,{k:'sheep',n:'the fluffy sheep',c:['white'],s:'fluffy',m:'wool',v:'soft and sleepy',snd:'baa',u:'knit a sweater from',e:'🐑🧶😴',r:['My fluffy coat turns into your winter sweater.'],mv:true});
   W.movers.push(t=>{const a=-t*0.05+2;const x=FX(40)+Math.cos(a)*9,z=FZ(20.5)+Math.sin(a)*6.2;s.position.set(x,landH(x,z),z);s.rotation.y=Math.atan2(Math.sin(a),-Math.cos(a));});}
  {const g=new THREE.Group();g.add(scl(at(sph(0.3,'#F2F2EC',8,6),0,0.5,0),0.8,0.9,1.2));g.add(at(sph(0.17,'#F2F2EC',6,5),0,0.8,0.28));
   g.add(at(scl(sph(0.08,'#8B5E3C',4,3,{ol:false}),1,1,2),0,0.62,0.44));for(const s of[-1,1])g.add(rot(at(cone(0.04,0.2,'#B08968',4,{ol:false}),0.07*s,0.98,0.22),-0.5,0,0.2*s));
   for(const s of[-1,1])for(const f of[-1,1])g.add(at(cyl(0.04,0.04,0.35,'#F2F2EC',4,{ol:false}),0.12*s,0.18,0.18*f));scene.add(g);
   F(g,{k:'goat',n:'the goat',c:['white'],s:'bony',m:'fur',v:'cheeky',snd:'meh-eh-eh',u:'let nibble your sleeve',e:'🐐🧔🥫',r:['I have a little beard and horns, and I’ll eat almost anything.'],mv:true});
   W.movers.push(t=>{const u=(t*0.25)%4;const x=FX(33)+Math.min(u,2)*2.4-Math.max(0,u-2)*2.4,z=FZ(17.5);g.position.set(x,landH(x,z)+Math.abs(Math.sin(t*6))*0.03,z);g.rotation.y=u<2?Math.PI/2:-Math.PI/2;});}
  const henMesh=(c,comb)=>{const g=new THREE.Group();g.add(scl(at(sph(0.2,c,8,6),0,0.25,0),0.9,0.9,1.2));g.add(at(sph(0.12,c,6,5),0,0.45,0.15));
    g.add(rot(at(cone(0.03,0.08,'#F2A541',4,{ol:false}),0,0.44,0.28),Math.PI/2,0,0));g.add(at(scl(sph(0.05,comb,4,3,{ol:false}),0.6,1,1.4),0,0.58,0.14));return g;};
  {const h=henMesh('#C8793C','#E8323F');scene.add(h);
   F(h,{k:'hen',n:'the hen',c:['brown'],s:'round',m:'feathers',v:'busy and bossy',snd:'cluck',u:'collect an egg from',e:'🐔🥚🌾',r:['I say cluck and leave you a surprise for breakfast.'],mv:true});
   const extra=[henMesh('#FFFFFF','#E8323F'),henMesh('#E8C45A','#E8323F')];extra.forEach(e=>{scene.add(e);F(e,{k:'chicken',n:'a chicken',c:['white'],s:'round',m:'feathers',p:false,mv:true});});
   W.movers.push(t=>{[h].concat(extra).forEach((c,i)=>{const a=t*0.3+i*2.1;const x=FX(42)+Math.cos(a)*1.8+Math.sin(t*1.3+i)*0.3,z=FZ(19.8)+Math.sin(a)*1.3;c.position.set(x,landH(x,z),z);c.rotation.y=-a;c.rotation.x=Math.max(0,Math.sin(t*4+i))*0.4;});});}
  {const x0r=FX(29);const r=henMesh('#E8323F','#FF3B3B');r.scale.setScalar(1.25);r.add(at(scl(sph(0.12,'#2B6CB0',5,4,{ol:false}),0.5,1,1.3),0,0.35,-0.25));
   r.position.set(x0r,landH(x0r,FZ(20))+1,FZ(20));r.rotation.y=Math.PI/2;scene.add(r);
   F(r,{k:'rooster',n:'the rooster',c:['red','blue'],s:'proud',m:'feathers',v:'loud and proud',snd:'cock-a-doodle-doo',u:'wake up early with',e:'🐓🌅📢',r:['I stand on the fence and wake everyone at sunrise.']});}
}

function buildOrchard(){
  {const g=new THREE.Group();for(const s of[-1,1])g.add(at(box(0.25,3,0.25,'#8B5E3C'),1.6*s,1.5,0));
   const t=signBox('Core Blimey Orchard',3.6,0.7,'#7A2E2E','#FFFFFF');t.position.y=3;g.add(t);g.add(at(box(3.6,0.15,0.3,'#8B5E3C',{ol:false}),0,3.45,0));
   place(g,GATE[0],GATE[1],0.3,{k:'gate',n:'the orchard gate',c:['brown','red'],s:'arched',m:'wood',v:'welcoming',u:'walk into the orchard through',e:'🚪🍎🌳',r:['Walk under me to reach the fruit trees.']},{exact:true,ry:0,solid:false});
   circ(GATE[0]-1.6,GATE[1],0.3);circ(GATE[0]+1.6,GATE[1],0.3);}
  const appleTree=fruitTree(OX(35),OZ(-19),['#4FAF52','#63C35E','#3E9E4A'],'#E8323F',{k:'apple tree',n:'the apple tree',c:['green','red'],s:'round',m:'wood',v:'generous',snd:'thud (falling apple)',u:'pick a snack from',e:'🌳🍎🩺',
    r:['I grow the red fruit that keeps the doctor away.','Newton sat under a tree like me and got bonked on the head.']});
  fruitTree(OX(39.5),OZ(-17.5),['#6CC05A','#7ED957','#58B04E'],'#C9E265',{k:'pear tree',n:'the pear tree',c:['green'],s:'round',m:'wood',v:'a bit shy',u:'pick pears from',e:'🌳🍐💡',r:['My green fruit is shaped like a lightbulb.']});
  fruitTree(OX(38.5),OZ(-22.5),['#FFB3D1','#FF8FBF','#FFC8DF'],'#B3122E',{k:'cherry tree',n:'the cherry tree',c:['pink','red'],s:'round and fluffy',m:'wood',v:'pretty in pink',u:'pick cherries from',e:'🌸🍒🌳',r:['My tiny red fruit comes in pairs on long stems.']});
  fruitTree(OX(42.5),OZ(-20),['#5E9E4A','#6CC05A','#4F8F3E'],'#7B3FA0',{k:'plum tree',n:'the plum tree',c:['green','purple'],s:'round',m:'wood',v:'sweet and juicy',u:'pick plums from',e:'🌳🟣😋',r:['My purple fruit dries into a wrinkly prune.']});
  // tire swing hangs from the apple tree (its own find)
  {const sw=new THREE.Group();sw.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new V3(0,0,0),new V3(0,-1.8,0)]),new THREE.LineBasicMaterial({color:0x2B2040})));
   const tire=mk(new THREE.TorusGeometry(0.35,0.12,6,12),'#2B2040');tire.position.y=-2;sw.add(tire);
   sw.position.copy(worldAt(appleTree,1.1,2.2,0));sw.rotation.y=appleTree.rotation.y;scene.add(sw);
   F(sw,{k:'tire swing',n:'the tire swing',c:['black'],s:'round',m:'rubber',v:'swaying gently',snd:'creak',u:'swing on',e:'🛞🌳😄',r:['I used to roll along on a car; now I hang from a branch for kids.'],mv:true});
   W.movers.push(t=>{sw.rotation.x=Math.sin(t*1.2)*0.15;});}
  // fruit stand, cider press, ladder, hammock, cart
  {const g=new THREE.Group();g.add(at(box(2.6,0.9,1.1,'#C8935E'),0,0.45,0));for(const s of[-1,1])g.add(at(cyl(0.06,0.06,2.2,'#8B5E3C',5),1.2*s,1.1,-0.45));
   const aw=mk(new THREE.BoxGeometry(2.9,0.1,1.4),0,{mat:MT(stripeTex('#E8323F','#FFFFFF',8))});aw.position.set(0,2.2,-0.1);aw.rotation.x=-0.2;g.add(aw);
   for(let i=0;i<3;i++)g.add(at(sph(0.3,['#E8323F','#C9E265','#7B3FA0'][i],8,6,{w:0.02}),-0.8+i*0.8,1.1,0));
   const s=signBox('FRESH FRUIT',1.8,0.35,'#FFFFFF','#E8323F');s.position.set(0,0.5,0.58);g.add(s);
   place(g,OX(34.5),OZ(-24.5),1.4,{k:'fruit stand',n:'the fruit stand',c:['red','white'],s:'boxy',m:'wood',v:'fresh and cheerful',u:'buy fresh fruit at',e:'🍎🍐🏪',r:['I sell whatever the trees just dropped, fresh and cheap.']},{ry:Math.PI*0.8});}
  {const g=new THREE.Group();g.add(at(cyl(0.6,0.6,0.9,'#8B5E3C',12),0,0.45,0));for(let i=0;i<3;i++)g.add(at(cyl(0.62,0.62,0.06,'#2B2040',12,{ol:false}),0,0.15+i*0.3,0));
   for(const s of[-1,1])g.add(at(box(0.15,1.8,0.15,'#8B5E3C'),0.7*s,0.9,0));g.add(at(box(1.6,0.2,0.2,'#8B5E3C'),0,1.8,0));g.add(at(cyl(0.06,0.06,0.9,'#555',6,{ol:false}),0,1.35,0));
   g.add(at(cyl(0.45,0.45,0.1,'#B08968',10),0,1.0,0));
   place(g,OX(41),OZ(-24.5),0.9,{k:'cider press',n:'the cider press',c:['brown'],s:'barrel-shaped',m:'wood',v:'squeezy',snd:'squish',u:'squeeze apples into juice with',e:'🍎➡️🧃',r:['Squeeze apples in me and out comes a sweet drink.']});}
  {const g=new THREE.Group();for(const s of[-1,1])g.add(at(box(0.08,3.2,0.08,'#B08968',{ol:false}),0.3*s,1.6,0));for(let i=0;i<7;i++)g.add(at(box(0.6,0.06,0.06,'#B08968',{ol:false}),0,0.3+i*0.42,0));g.rotation.x=-0.25;
   place(g,OX(40.5),OZ(-16.7),0.4,{k:'ladder',n:'the tall ladder',c:['brown'],s:'tall and skinny',m:'wood',v:'always helpful',u:'reach the top fruit with',e:'🪜🍐⬆️',r:['Climb my rungs to reach the fruit at the very top.']},{solid:false});}
  {const g=new THREE.Group();for(const s of[-1,1])g.add(at(cyl(0.12,0.15,2.2,'#8B5E3C',6),1.6*s,1.1,0));
   const hm=mk(new THREE.CylinderGeometry(0.5,0.5,2.8,12,1,true,Math.PI*0.6,Math.PI*0.8),null,{mat:new THREE.MeshToonMaterial({color:'#FF9F1C',side:THREE.DoubleSide,gradientMap:gradTex}),ol:false});
   hm.rotation.z=Math.PI/2;hm.position.y=1.35;g.add(hm);
   place(g,OX(44.5),OZ(-23),1.8,{k:'hammock',n:'the hammock',c:['orange'],s:'saggy',m:'rope',v:'lazy on purpose',snd:'creak',u:'nap in',e:'😴🌴🟧',r:['I hang between two posts and rock you to sleep.']},{ry:0.4});
   W.movers.push(t=>{hm.rotation.x=Math.sin(t*0.9)*0.12;});}
  {const g=new THREE.Group();g.add(at(box(1.8,0.6,1.1,'#B08968'),0,0.75,0));for(const s of[-1,1])g.add(rot(at(cyl(0.38,0.38,0.12,'#8B5E3C',10),0.95*s,0.38,0),0,0,Math.PI/2));
   for(let i=0;i<5;i++)g.add(at(sph(0.2,'#E8323F',6,5,{w:0.02}),-0.6+i*0.3,1.15,(i%2)*0.2-0.1));g.add(rot(at(cyl(0.04,0.04,1.4,'#8B5E3C',5,{ol:false}),-1.4,0.8,0),0,0,1.2));
   place(g,OX(37),OZ(-26.5),1.2,{k:'cart',n:'the fruit cart',c:['brown','red'],s:'boxy',m:'wood',v:'heavy with apples',snd:'rumble',u:'wheel the harvest home in',e:'🛒🍎🍎',r:['Push me along and I’ll carry the whole harvest.']},{ry:-0.3});}
  // water tower on the hilltop
  {const g=new THREE.Group();for(const [sx,sz] of[[-1,-1],[1,-1],[-1,1],[1,1]])g.add(at(cyl(0.1,0.1,5,'#8B5E3C',5,{ol:false}),sx*0.9,2.5,sz*0.9));
   g.add(at(cyl(1.4,1.4,1.8,'#9C6B3F',12),0,5.9,0));g.add(at(cone(1.6,0.9,'#7A2E2E',12),0,7.25,0));
   place(g,OX(44),OZ(-16.5),1.3,{k:'water tower',n:'the water tower',c:['brown','red'],s:'tall',m:'wood',v:'towering over everyone',snd:'drip',u:'store the farm’s water in',e:'💧🗼🌳',r:['I stand on stilts holding a giant bucket of water for the whole farm.']});}
  // small things
  {const g=new THREE.Group();for(const x of[-0.4,0.4]){g.add(at(box(0.6,0.5,0.6,'#FFFFFF',{w:0.02}),x,0.45,0));g.add(at(box(0.6,0.3,0.6,'#FFFFFF',{w:0.02}),x,0.85,0));g.add(at(box(0.7,0.06,0.7,'#E8C45A',{ol:false}),x,1.03,0));}
   for(const s of[-1,1])g.add(at(box(0.08,0.2,0.08,'#8B5E3C',{ol:false}),0.4*s,0.1,0));
   const bees=[];for(let i=0;i<4;i++){const b=sph(0.06,'#FFD23F',5,4,{w:0.015});g.add(b);bees.push(b);}
   place(g,OX(43.5),OZ(-26),0.6,{k:'beehives',n:'the beehives',c:['white','yellow'],s:'boxy',m:'wood',v:'buzzing with work',snd:'bzzzz',u:'collect honey from',e:'🐝🏠🍯',r:['Thousands of busy workers live in my stacked wooden boxes.']},{solid:false});
   W.movers.push(t=>{bees.forEach((b,i)=>{const a=t*3+i*1.6;b.position.set(Math.cos(a)*0.8,1.2+Math.sin(t*5+i)*0.25,Math.sin(a*1.3)*0.6);});});}
  {const g=G_(at(cyl(0.12,0.14,0.22,'#FFB627',8,{w:0.015}),0,0.11,0),at(cyl(0.13,0.13,0.06,'#B5793A',8,{ol:false}),0,0.25,0));
   const [x,z]=freeSpot(OX(34.6),OZ(-24.1),0.1,false);g.position.set(x,landH(x,z)+0.9,z);scene.add(g);
   F(g,{k:'honey',n:'the honey jar',c:['gold'],s:'round',m:'glass',v:'sticky sweet',u:'spread on toast',e:'🍯🐻🍞',r:['I’m sticky and golden, and bears would do anything for me.']});}
  {const g=at(sph(0.14,'#E8323F',8,6,{w:0.02}),0,0.14,0);const w=G_(g,at(cyl(0.015,0.015,0.1,'#5B3A29',4,{ol:false}),0,0.3,0));
   place(w,OX(36.2),OZ(-18.2),0.15,{k:'apple',n:'the fallen apple',c:['red'],s:'round',m:'fruit',v:'a little bruised',u:'pick up and polish',e:'🍎⬇️🌱',r:['I dropped off my branch and now I’m waiting in the grass.']},{solid:false});}
  {const g=G_(at(cyl(0.3,0.22,0.3,'#B08968',10,{w:0.02}),0,0.15,0));for(const [x,z] of[[-0.1,0],[0.12,0.05],[0,-0.12],[0.02,0.08]])g.add(at(sph(0.1,'#E8323F',6,5,{ol:false}),x,0.33,z));
   place(g,OX(36.8),OZ(-21.2),0.3,{k:'basket',n:'the apple basket',c:['brown','red'],s:'round',m:'wicker',v:'full and happy',u:'fill with picked apples',e:'🧺🍎🍎',r:['Pickers fill me to the brim and carry me home.']},{solid:false});}
  {const g=G_(at(cyl(0.22,0.18,0.3,'#8FA3B8',8,{w:0.02}),0,0.15,0));for(const [x,z] of[[-0.07,0],[0.08,0.04],[0,-0.08]])g.add(at(scl(sph(0.08,'#C9E265',6,5,{ol:false}),1,1.3,1),x,0.34,z));
   place(g,OX(40.8),OZ(-18.6),0.25,{k:'bucket',n:'the bucket of pears',c:['silver','green'],s:'round',m:'metal',v:'a bit top-heavy',u:'carry pears in',e:'🪣🍐🍐',r:['I’m a metal pail full of lightbulb-shaped fruit.']},{solid:false});}
  {const tree=W.list.find(o=>o.n==='the plum tree').obj;const owl=new THREE.Group();owl.add(scl(at(sph(0.2,'#8B5E3C',8,6),0,0,0),0.9,1.2,0.9));
   for(const s of[-1,1]){owl.add(at(sph(0.07,'#FFD23F',6,5,{w:0.01}),0.08*s,0.08,0.16));owl.add(at(sph(0.03,'#1D1533',4,3,{ol:false,shadow:false}),0.08*s,0.08,0.21));owl.add(rot(at(cone(0.04,0.1,'#8B5E3C',3,{ol:false}),0.1*s,0.25,0),0,0,-0.3*s));}
   owl.position.copy(worldAt(tree,0.55,1.95,0.3));owl.rotation.y=0.5;scene.add(owl);
   F(owl,{k:'owl',n:'the owl',c:['brown'],s:'round',m:'feathers',v:'wise and sleepy',snd:'hoo-hoo',u:'ask a question at midnight',e:'🦉🌙📚',r:['I stay awake all night asking “who? who?”']});}
  {const g=new THREE.Group();g.add(scl(at(sph(0.12,'#8B5E3C',6,5),0,0,0),0.9,0.9,1.3));g.add(at(scl(sph(0.08,'#E8563F',5,4,{ol:false}),1,1,0.6),0,-0.02,0.1));g.add(rot(at(cone(0.02,0.06,'#F2A541',3,{ol:false}),0,0.03,0.17),Math.PI/2,0,0));
   g.position.set(GATE[0]+0.9,landH(GATE[0],GATE[1])+3.62,GATE[1]);g.rotation.y=Math.PI/2;scene.add(g);
   F(g,{k:'robin',n:'the robin',c:['brown','red'],s:'tiny',m:'feathers',v:'chirpy',snd:'tweet-tweet',u:'listen to a song from',e:'🐦❤️🎶',r:['I’m a little brown bird with a bright red chest.']});}
  {const g=G_(at(cyl(0.12,0.2,0.9,'#B8B2C8',8),0,0.45,0),at(cyl(0.5,0.3,0.18,'#B8B2C8',12),0,0.95,0),at(mk(new THREE.CylinderGeometry(0.42,0.42,0.03,12),'#6ED3EC',{ol:false}),0,1.03,0));
   place(g,OX(33.5),OZ(-21.5),0.5,{k:'birdbath',n:'the birdbath',c:['grey','blue'],s:'round',m:'stone',v:'refreshing',snd:'splish',u:'give birds a bath',e:'🐦🛁💧',r:['Birds splash about in my shallow stone bowl.']});}
  {const g=new THREE.Group();g.add(at(scl(sph(0.08,'#C8793C',8,6,{w:0.01}),1,1,0.6),0,0.08,0));g.add(at(scl(sph(0.05,'#A7B88A',5,4,{ol:false}),2.2,0.6,0.8),0.06,0.02,0));
   g.add(at(cyl(0.01,0.01,0.06,'#A7B88A',3,{ol:false}),0.14,0.07,0));g.position.set(GATE[0]-1.6,landH(GATE[0],GATE[1])+1.4,GATE[1]+0.22);g.rotation.z=Math.PI/2;scene.add(g);
   F(g,{k:'snail',n:'the snail',c:['brown'],s:'spiral',m:'shell',v:'in no hurry at all',u:'race very, very slowly',e:'🐌🏠🐢',r:['I carry my house on my back and leave a shiny trail.']});}
  {const g=G_(rot(at(box(0.18,0.05,0.28,'#4CB85A',{w:0.01}),-0.1,0.03,0),0,0.3,0),rot(at(box(0.18,0.05,0.28,'#4CB85A',{w:0.01}),0.12,0.03,0.05),0,-0.2,0));
   place(g,OX(38),OZ(-25.3),0.25,{k:'gloves',n:'the gardening gloves',c:['green'],s:'flat',m:'fabric',v:'a bit muddy',u:'protect your hands in the garden',e:'🧤🌱🪴',r:['Two of us keep your hands clean while you dig.']},{solid:false});}
  {const g=G_(rot(at(box(0.04,0.35,0.05,'#E8323F',{w:0.01}),-0.04,0.05,0),0,0,0.3),rot(at(box(0.04,0.35,0.05,'#E8323F',{w:0.01}),0.04,0.05,0),0,0,-0.3),at(box(0.05,0.2,0.02,'#C8D4E0',{ol:false}),0,0.3,0));g.rotation.x=Math.PI/2;
   place(g,OX(42),OZ(-22.5),0.2,{k:'shears',n:'the pruning shears',c:['red','silver'],s:'pointy',m:'metal',v:'snappy',snd:'snip',u:'trim branches with',e:'✂️🌿🌳',r:['Snip, snip: I give the fruit trees a haircut.']},{solid:false,y:0.03});}
}
