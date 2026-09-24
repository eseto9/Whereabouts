/* =========================================================
   The Park
   ========================================================= */
function tree(x,z,kind,meta){
  const g=new THREE.Group();
  if(kind==='pine'){g.add(at(cyl(0.18,0.25,1.2,'#8B5E3C',6),0,0.6,0));g.add(at(cone(1.5,2.2,'#3E9E6A',7),0,2.1,0));g.add(at(cone(1.15,1.8,'#4CB87A',7),0,3.1,0));g.add(at(cone(0.75,1.4,'#5ACB88',7),0,3.9,0));}
  else{const cc=kind==='blossom'?['#FFB3D1','#FF8FBF','#FFC8DF']:kind==='oak'?['#4FAF52','#63C35E','#3E9E4A']:['#6CC05A','#7ED957','#58B04E'];const s=kind==='oak'?1.7:1;
    g.add(at(cyl(0.22*s,0.32*s,1.9*s,'#8B5E3C',7),0,0.95*s,0));
    g.add(at(sph(1.3*s,cc[0],7,5),0,2.7*s,0));g.add(at(sph(0.95*s,cc[1],7,5),0.8*s,2.3*s,0.35*s));g.add(at(sph(0.9*s,cc[2],7,5),-0.7*s,2.4*s,-0.4*s));}
  onGround(g,x,z);g.rotation.y=srand()*TAU;F(g,meta||{k:'tree',n:'a tree',c:['green'],s:kind==='pine'?'pointy':'round',m:'wood',p:false});circ(x,z,kind==='oak'?0.8:0.5);return g;
}
function buildPark(){
  // pond
  {const g=new THREE.Group();const y=landH(POND.x,POND.z);
   const water=new THREE.Mesh(new THREE.CircleGeometry(POND.r,32),new THREE.MeshToonMaterial({color:'#6ED3EC',gradientMap:gradTex}));water.rotation.x=-Math.PI/2;water.position.y=0.08;water.receiveShadow=true;g.add(water);
   for(let i=0;i<22;i++){const a=i/22*TAU;g.add(scl(at(sph(0.45,i%3?'#B8B2C8':'#CFC9DD',6,4,{w:0.03}),Math.cos(a)*POND.r,0.1,Math.sin(a)*POND.r),1.2,0.6,1));}
   g.position.set(POND.x,y,POND.z);scene.add(g);
   F(g,{k:'pond',n:'the duck pond',c:['blue'],s:'round',m:'water',v:'calm and reflective',snd:'plip',u:'skip stones across',e:'🦆💧🪨'});
   circ(POND.x,POND.z,POND.r+0.2);}
  const pads=[[-36,4],[-40,8],[-39,2.5],[-35.5,8.5]];
  pads.forEach(([x,z])=>{const p=mk(new THREE.CylinderGeometry(0.6,0.6,0.05,10,1,false,0,TAU*0.88),'#4CB85A',{w:0.02});p.position.set(x,landH(POND.x,POND.z)+0.14,z);scene.add(p);F(p,{k:'lilypad',n:'a lily pad',c:['green'],s:'flat',m:'leaf',p:false});});
  // frog
  {const g=new THREE.Group();g.add(scl(sph(0.28,'#5ACB3A',8,6),1.1,0.7,1));for(const s of[-1,1]){g.add(at(sph(0.1,'#5ACB3A',6,5),0.14*s,0.2,0.12));g.add(at(sph(0.05,'#1D1533',5,4,{ol:false,shadow:false}),0.14*s,0.24,0.2));}
   scene.add(g);
   F(g,{k:'frog',n:'the frog',c:['green'],s:'round',m:'skin',v:'jumpy',snd:'ribbit',u:'kiss for a tiny chance at royalty',e:'🐸👑💋',r:'I hop from pad to pad and sing at night.',mv:true});
   const py=landH(POND.x,POND.z)+0.25;const keys=[];pads.forEach(p=>{keys.push({p:[p[0],py,p[1]],d:2.2});keys.push({p:[p[0],py,p[1]],d:0.6,hop:1.2});});
   const tmp=new V3();const path=loopPath(keys);
   W.movers.push(t=>{const r=path(t,tmp);g.position.copy(tmp);if(r.moving)g.rotation.y=Math.atan2(r.dx,r.dz);});}
  // ducks
  {const mama=duckMesh(true);scene.add(mama);
   F(mama,{k:'duck',n:'the mama duck',c:['white'],s:'round',m:'feathers',v:'very organized',snd:'quack',u:'follow in a neat line',e:'🦆👶👶👶',r:'I lead a very small parade across the water.',mv:true});
   const kids=[0,1,2].map(()=>{const d=duckMesh(false);scene.add(d);F(d,{k:'duckling',n:'a duckling',c:['yellow'],s:'round',m:'fluff',p:false,mv:true});return d;});
   const py=landH(POND.x,POND.z)+0.02;
   W.movers.push(t=>{[mama].concat(kids).forEach((d,i)=>{const a=t*0.25-i*0.35;d.position.set(POND.x+Math.cos(a)*3.6,py+Math.sin(t*3+i)*0.03,POND.z+Math.sin(a)*3.6);d.rotation.y=-a;});});}
  // gazebo
  {const g=new THREE.Group();g.add(at(cyl(3.2,3.3,0.4,'#FFFFFF',8),0,0.2,0));
   for(let i=0;i<8;i++){const a=i/8*TAU;if(i===2)continue;g.add(at(cyl(0.12,0.12,2.8,'#FFFFFF',6),Math.cos(a)*2.9,1.8,Math.sin(a)*2.9));}
   g.add(at(cone(3.8,2,'#E06D8B',8),0,4.2,0));g.add(at(sph(0.25,'#FFD23F',8,6),0,5.3,0));
   onGround(g,-36,-12);
   F(g,{k:'gazebo',n:'the gazebo',c:['white','pink'],s:'round',m:'wood',v:'fancy',u:'shelter from the rain under',e:'💒☔🎻'});
   for(let i=0;i<8;i++){if(i===2)continue;const a=i/8*TAU;circ(-36+Math.cos(a)*2.9,-12+Math.sin(a)*2.9,0.3);}}
  // playground: slide + swings + sandbox
  {const g=new THREE.Group();
   for(const s of[-1,1])for(const f of[-1,1])g.add(at(cyl(0.07,0.07,2.4,'#4D96FF',6),0.5*s,1.2,0.5*f));
   g.add(at(box(1.2,0.1,1.2,'#4D96FF'),0,2.3,0));
   const sl=box(0.9,0.1,3.4,'#FF5D73');sl.position.set(0,1.25,2);sl.rotation.x=0.66;g.add(sl);
   for(let i=0;i<5;i++)g.add(at(box(0.9,0.06,0.1,'#FFD23F',{ol:false}),0,0.4+i*0.4,-0.55));
   onGround(g,-44,16);g.rotation.y=0.4;
   F(g,{k:'slide',n:'the red slide',c:['red','blue'],s:'slopey',m:'plastic',v:'thrilled every single time',snd:'wheee',u:'zoom down',e:'🛝😆⬇️'});rect(-44,16,2,2);}
  {const g=new THREE.Group();
   for(const s of[-1,1]){g.add(rot(at(cyl(0.07,0.07,3,'#FFD23F',6),1.8*s,1.4,0.5),0.35,0,0));g.add(rot(at(cyl(0.07,0.07,3,'#FFD23F',6),1.8*s,1.4,-0.5),-0.35,0,0));}
   g.add(rot(at(cyl(0.08,0.08,3.8,'#FFD23F',6),0,2.8,0),0,0,Math.PI/2));
   const swings=[-0.8,0.8].map((x,i)=>{const p=new THREE.Group();p.position.set(x,2.8,0);
     p.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new V3(-0.25,0,0),new V3(-0.25,-2.1,0),new V3(0.25,0,0),new V3(0.25,-2.1,0)]),new THREE.LineBasicMaterial({color:0x2B2040})));
     p.add(at(box(0.6,0.08,0.3,i?'#3DDC97':'#9B5DE5',{w:0.02}),0,-2.15,0));g.add(p);return p;});
   onGround(g,-47,22);g.rotation.y=0.3;
   F(g,{k:'swing set',n:'the swing set',c:['yellow'],s:'wide',m:'metal',v:'forever carefree',snd:'squeak-squeak',u:'swing higher and higher on',e:'🔁😄🌤️',mv:true});
   circ(-47+1.8,22,0.4);circ(-47-1.8,22,0.4);
   W.movers.push(t=>{swings.forEach((p,i)=>{p.rotation.x=Math.sin(t*1.8+i*1.3)*0.45;});});}
  {const g=new THREE.Group();g.add(at(box(3,0.3,3,'#C8935E'),0,0.15,0));g.add(at(box(2.7,0.1,2.7,'#F8DE98',{ol:false}),0,0.3,0));
   const bk=grp(at(cyl(0.3,0.22,0.45,'#4D96FF',10,{w:0.03}),0,0,0),at(mk(new THREE.TorusGeometry(0.28,0.02,4,10,Math.PI),'#2B2040',{ol:false}),0,0.2,0));bk.position.set(0.6,0.55,0.3);g.add(bk);
   onGround(g,-40,23);F(g,{k:'bucket',n:'the sandbox bucket',c:['blue'],s:'round',m:'plastic',v:'ready for a big project',u:'build a sandcastle with',e:'🪣🏗️🏖️'});rect(-40,23,3,3);}
  // dog chasing a ball
  {const d=new THREE.Group();const c='#C68B59';
   d.add(scl(at(sph(0.35,c,8,6),0,0.5,0),0.8,0.8,1.5));d.add(at(sph(0.28,c,8,6),0,0.85,0.5));d.add(scl(at(sph(0.12,'#2B2040',6,4,{ol:false}),0,0.82,0.78),1,0.8,0.8));
   for(const s of[-1,1]){d.add(scl(at(sph(0.12,'#8B5E3C',6,4),0.24*s,0.95,0.45),0.6,1.5,1));}
   const legs=[];for(const s of[-1,1])for(const f of[-1,1]){const l=at(cyl(0.07,0.07,0.35,c,5,{ol:false}),0.18*s,0.2,0.3*f);d.add(l);legs.push(l);}
   const tail=rot(at(cyl(0.04,0.06,0.4,c,5),0,0.75,-0.55),-0.8,0,0);d.add(tail);scene.add(d);
   F(d,{k:'dog',n:'the dog',c:['brown'],s:'long',m:'fur',v:'thrilled about absolutely everything',snd:'woof',u:'play fetch with',e:'🐕🎾😁',r:"I'll chase this ball forever and never get bored.",mv:true});
   const ball=sph(0.18,'#C9F03C',8,6,{w:0.03});scene.add(ball);
   F(ball,{k:'ball',n:'the tennis ball',c:['yellow-green'],s:'round',m:'fuzz',v:'always on the run',snd:'boing',u:'throw for a dog',e:'🎾🐕💨',mv:true});
   const cx=-38,cz=27;
   W.movers.push(t=>{const a=t*0.9;const x=cx+Math.cos(a)*4.2,z=cz+Math.sin(a)*3.2;d.position.set(x,landH(x,z)+Math.abs(Math.sin(t*10))*0.08,z);
     d.rotation.y=Math.atan2(-Math.sin(a)*4.2,Math.cos(a)*3.2);
     const b=a+0.7,bx=cx+Math.cos(b)*4.2,bz=cz+Math.sin(b)*3.2;ball.position.set(bx,landH(bx,bz)+0.2+Math.abs(Math.sin(t*4))*1.1,bz);
     legs.forEach((l,i)=>{l.rotation.x=Math.sin(t*14+(i%2)*Math.PI)*0.6;});tail.rotation.z=Math.sin(t*16)*0.5;});}
  // squirrel on a tree
  {tree(-27,-18,'round');const s=new THREE.Group();const c='#B5651D';
   s.add(scl(at(sph(0.18,c,8,6),0,0,0),0.8,1.1,0.8));s.add(at(sph(0.13,c,8,6),0,0.2,0.08));
   s.add(scl(at(sph(0.2,'#D4893A',8,6),0,0.1,-0.25),0.7,1.5,0.7));scene.add(s);
   F(s,{k:'squirrel',n:'the squirrel',c:['brown'],s:'small and fluffy',m:'fur',v:'extremely busy',snd:'chitter',u:'offer an acorn',e:'🐿️🌰🌳',r:'I stash snacks everywhere and forget where I put them.',mv:true});
   W.movers.push(t=>{const u=(t%12)/12;const y=u<0.5?u*2:2-u*2;const gy=landH(-27,-18);
     if(u>0.85){const f=(u-0.85)/0.15;s.position.set(-27+0.4+Math.sin(f*Math.PI)*1.2,gy+0.2,-18+0.4+f*0.5);s.rotation.x=0;}
     else{s.position.set(-27+0.32,gy+0.4+y*1.6,-18+0.1);s.rotation.x=-Math.PI/2*(u<0.5?1:-1)*0.9;}});}
  // named trees
  tree(-28,27,'oak',{k:'oak',n:'the giant oak tree',c:['green','brown'],s:'huge and round',m:'wood',v:'old and wise',snd:'rustle',u:'climb or nap under',e:'🌳👴🦉',r:"I've been here longer than anyone in town."});
  tree(-44,-6,'blossom',{k:'blossom tree',n:'the pink blossom tree',c:['pink'],s:'round and fluffy',m:'petals',v:'blushing',snd:'rustle',u:'catch falling petals under',e:'🌸🌳💗'});
  // picnic
  {const g=new THREE.Group();const ck=canvasTex(128,128,(x)=>{for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.fillStyle=(i+j)%2?'#FF5D73':'#FFFFFF';x.fillRect(i*16,j*16,16,16);}});
   const bl=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.04,2),MT(ck));bl.position.y=0.03;bl.receiveShadow=true;g.add(bl);
   g.add(at(box(0.7,0.45,0.5,'#C8935E'),0.4,0.26,0.2));const h=mk(new THREE.TorusGeometry(0.25,0.04,4,10,Math.PI),'#8B5E3C');h.position.set(0.4,0.5,0.2);g.add(h);
   g.add(at(box(0.3,0.1,0.3,'#FFE8A3',{w:0.02}),-0.6,0.1,-0.3));g.add(at(cyl(0.12,0.12,0.3,'#3DDC97',8,{w:0.02}),-0.4,0.2,0.4));
   onGround(g,-47.5,8);g.rotation.y=0.4;
   F(g,{k:'picnic basket',n:'the picnic basket',c:['red','white'],s:'flat',m:'fabric',v:'a little bit peckish',u:'share sandwiches from',e:'🧺🥪🐜',r:'Ants are my biggest fans.'});}
  // ice cream cart
  {const g=new THREE.Group();g.add(at(box(2,1.2,1.1,'#FFFFFF'),0,1,0));g.add(at(box(2.05,0.25,1.15,'#F15BB5'),0,1.2,0));
   for(const s of[-1,1])g.add(rot(at(cyl(0.35,0.35,0.12,'#2B2040',10),0.6*s,0.35,0.6),Math.PI/2,0,0));
   g.add(at(cyl(0.04,0.04,1.6,'#FFFFFF',5,{ol:false}),0,2.2,0));const u=mk(new THREE.ConeGeometry(1.4,0.6,10),0,{mat:MT(stripeTex('#F15BB5','#FFFFFF',10))});u.position.y=3.1;g.add(u);
   const ic=grp(at(cone(0.18,0.45,'#E8B26A',8,{w:0.02}),0,0,0),at(sph(0.2,'#FFB3D1',8,6,{w:0.02}),0,0.3,0));ic.rotation.x=Math.PI;ic.position.set(0,2.05,0.3);ic.rotation.x=0;ic.children[0].rotation.x=Math.PI;g.add(ic);
   onGround(g,-31,-3.5);g.rotation.y=Math.PI/2;
   F(g,{k:'ice cream cart',n:'the ice cream cart',c:['pink','white'],s:'boxy',m:'metal',v:'sweet and a bit melty',snd:'ding-a-ling',u:'buy a cone from',e:'🍦🛒☀️'});
   rect(-31,-3.5,1.3,2.2);}
  // topiary Wanderbean
  {const g=new THREE.Group();g.add(at(cyl(0.6,0.5,0.6,'#C8703F',10),0,0.3,0));g.add(at(cap(0.55,0.7,'#3E9E4A'),0,1.55,0));
   for(const s of[-1,1])g.add(at(sph(0.13,'#FFFFFF',6,5,{ol:false}),0.18*s,1.85,0.48));
   onGround(g,-30,-23);
   F(g,{k:'hedge',n:'the bean-shaped hedge',c:['green'],s:'bean-shaped',m:'leaves',v:'very well groomed',u:'trim with giant scissors',e:'🌿✂️🫘',r:"Someone trimmed me to look just like you."});circ(-30,-23,0.7);}
  // park sign
  {const g=new THREE.Group();g.add(at(box(0.18,1.6,0.18,'#8B5E3C'),-1.1,0.8,0));g.add(at(box(0.18,1.6,0.18,'#8B5E3C'),1.1,0.8,0));
   const s=signBox('Whereabouts Park',3,0.8,'#3E9E4A','#FFFFFF');s.position.y=1.6;g.add(s);
   onGround(g,-29,3.2);g.rotation.y=Math.PI/2;
   F(g,{k:'sign',n:'the park sign',c:['green','white'],s:'flat',m:'wood',v:'very welcoming',u:'read to find your way',e:'🪧🌳👋'});rect(-29,3.2,0.4,2.6);}
  // generic trees
  const keepOut=[[POND.x,POND.z,8],[-36,-12,5],[-44,16,3],[-47,22,3.5],[-40,23,2.5],[-38,27,6],[-47.5,8,2.2],[-31,-3.5,2],[-30,-23,1.6],[-28,27,3],[-44,-6,3],[-27,-18,2],[-29,3.2,2.5],[-30,-40,2.5]];
  let placed=0,tries=0;
  while(placed<30&&tries<900){tries++;
    const x=sr(-52,-20),z=sr(-30,34);
    if(edgeDist(x,z)<9)continue; const r=Math.hypot(x,z); if(Math.abs(r-26)<4.5)continue; if(Math.abs(z)<3.5&&x>-32)continue;
    if(keepOut.some(([a,b,d])=>Math.hypot(x-a,z-b)<d))continue;
    keepOut.push([x,z,3]); tree(x,z,srand()<0.35?'pine':'round'); placed++;}
  // trees framing hill and harbor edges
  [[-34,-30],[-38,-24],[30,-46],[-27,-48],[-26,36],[-32,30],[55,12]].forEach(([x,z])=>{if(edgeDist(x,z)>8.5)tree(x,z,srand()<0.5?'pine':'round');});
  // park benches
  [[-33,12,1.2],[-42,-14,0.2]].forEach(([x,z,r])=>{const g=new THREE.Group();g.add(at(box(2.2,0.14,0.6,'#4CB85A'),0,0.55,0));g.add(at(box(2.2,0.5,0.1,'#4CB85A'),0,0.9,-0.28));
    for(const s of[-1,1])g.add(at(box(0.1,0.55,0.55,'#2B2040',{w:0.02}),0.95*s,0.27,0));onGround(g,x,z);g.rotation.y=r;F(g,{k:'bench',n:'a bench',c:['green'],s:'long',m:'wood',p:false});circ(x,z,1.1);});
}

