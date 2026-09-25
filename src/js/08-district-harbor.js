/* =========================================================
   The Harbor
   ========================================================= */
function buildHarbor(){
  const plank=canvasTex(64,256,(x,W,H)=>{x.fillStyle='#C9A071';x.fillRect(0,0,W,H);x.fillStyle='#B48859';for(let i=0;i<16;i++)x.fillRect(0,i*16,W,3);});
  plank.wrapS=plank.wrapT=THREE.RepeatWrapping;
  const pier=new THREE.Group();
  const t1=plank.clone();t1.needsUpdate=true;t1.repeat.set(1,6);
  const deck=mk(new THREE.BoxGeometry(3.2,0.25,26),0,{mat:MT(t1)});deck.position.set(0,0.43,60);pier.add(deck);
  const t2=plank.clone();t2.needsUpdate=true;t2.repeat.set(3,1);t2.rotation=Math.PI/2;
  const tee=mk(new THREE.BoxGeometry(12.2,0.25,3.2),0,{mat:MT(t2)});tee.position.set(0,0.43,71.5);pier.add(tee);
  for(let z=50;z<=70;z+=4)for(const s of[-1,1]){pier.add(at(cyl(0.18,0.18,2.4,'#8B5E3C',6),1.55*s,-0.7,z));pier.add(at(cyl(0.16,0.2,0.4,'#3B3F58',8,{w:0.02}),1.35*s,0.75,z));}
  for(const x of[-5.8,5.8])for(const z of[70,73])pier.add(at(cyl(0.18,0.18,2.4,'#8B5E3C',6),x,-0.7,z));
  scene.add(pier); F(pier,{k:'pier',n:'the pier',c:['brown'],s:'long',m:'wood',p:false});
  W.docks.push({x0:-1.65,x1:1.65,z0:47,z1:73.1,y:0.56},{x0:-6.1,x1:6.1,z0:69.9,z1:73.1,y:0.56});

  // lighthouse with sweeping beam
  {const g=new THREE.Group();
   const cols=['#FFFFFF','#FF5D73','#FFFFFF','#FF5D73'];
   for(let i=0;i<4;i++){const r0=2.3-i*0.22,r1=2.3-(i+1)*0.22;g.add(at(cyl(r1,r0,3,cols[i],16),0,1.5+i*3,0));}
   g.add(at(cyl(1.9,1.9,0.3,'#2B2040',16),0,12.15,0));
   const lamp=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,1.7,12),new THREE.MeshToonMaterial({color:'#FFF2A8',emissive:'#FFD23F',emissiveIntensity:0.6,gradientMap:gradTex}));
   lamp.position.y=13.15;outline(lamp,0.05);g.add(lamp);
   g.add(at(cone(1.45,1.6,'#FF5D73',12),0,14.8,0)); g.add(at(sph(0.2,'#2B2040',6,5),0,15.7,0));
   g.add(at(box(1.2,2,0.2,'#2B2040',{w:0.03}),0,1,2.25));
   const beam=new THREE.Group();const bm=new THREE.MeshBasicMaterial({color:0xFFF3B0,transparent:true,opacity:0.22,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
   for(const s of[-1,1]){const c=new THREE.Mesh(new THREE.ConeGeometry(2.2,26,16,1,true),bm);c.rotation.z=s*Math.PI/2;c.position.x=s*13;c.raycast=()=>{};beam.add(c);}
   beam.position.y=13.2;g.add(beam);
   onGround(g,24,44);
   F(g,{k:'lighthouse',n:'the lighthouse',c:['red','white'],s:'tall and stripy',m:'brick',v:'keeping an eye on everyone',snd:'whoooo (foghorn)',u:'guide ships home with',e:'🌊🚢😉💡',r:'I stand by the sea and wink at ships all night long.'});
   circ(24,44,2.4);
   W.movers.push(t=>{beam.rotation.y=t*0.7;});}

  // fish shack
  {const g=new THREE.Group();
   g.add(at(box(6,3.4,4.4,'#8FB8DE'),0,1.7,0));
   const r=mk(prismGeo(6.6,1.8,5),'#3B5B8C');r.position.y=3.4;g.add(r);
   g.add(at(box(1.2,2,0.2,'#8A5A44',{w:0.03}),-1.4,1,2.25));
   const s=signBox('The Plaice to Be',3.4,0.8,'#FFFFFF','#2B2040');s.position.set(1.2,2.8,2.3);g.add(s);
   const fish=new THREE.Group();fish.add(scl(sph(0.5,'#FF6FB5',10,8,{w:0.04}),2,1,0.4));fish.add(rot(at(cone(0.45,0.6,'#FF6FB5',3,{w:0.04}),-1.25,0,0),0,0,Math.PI/2));
   fish.position.set(0,5.9,0);g.add(fish);
   onGround(g,-12,44); g.rotation.y=0.25;
   F(g,{k:'shack',n:'the Plaice to Be fish shack',c:['blue','pink'],s:'boxy',m:'wood',v:'weathered but happy',snd:'sizzle',u:'grab fish and chips at',e:'🐟🍟🏚️'});
   rect(-12,44,6.4,5);
   W.movers.push(t=>{fish.rotation.y=Math.sin(t*1.5)*0.4;});}

  // crates, lemons, barrels
  [[5,45.5,0],[6.3,45.5,0],[5.6,45.5,1.05],[5,46.8,0]].forEach(([x,z,y],i)=>{const c=box(1.1,1,1.1,'#C8935E');c.position.set(x,landH(x,z)+0.5+y,z);c.rotation.y=i*0.2;scene.add(c);F(c,{k:'crate',n:'a wooden crate',c:['brown'],s:'boxy',m:'wood',p:false});});
  rect(5.6,46.1,2.6,2.6);
  {const g=new THREE.Group();g.add(at(box(1.1,0.8,1.1,'#E3B36B'),0,0.4,0));for(let i=0;i<7;i++)g.add(scl(at(sph(0.17,'#FFE14D',7,5,{w:0.02}),Math.cos(i*0.9)*0.3,0.85+(i%2)*0.08,Math.sin(i*0.9)*0.3),1.2,1,1));
   onGround(g,7.8,45);F(g,{k:'lemons',n:'the crate of lemons',c:['yellow'],s:'boxy',m:'wood',v:'a bit sour about it',u:'make lemonade with',e:'🍋📦😖',r:'When life gives you me, make lemonade.'});circ(7.8,45,0.8);}
  [[8.8,48.2],[9.8,47.2],[3.2,48.6]].forEach(([x,z])=>{const b=new THREE.Group();b.add(at(cyl(0.5,0.5,1.2,'#9C6B3F',10),0,0.6,0));b.add(at(cyl(0.53,0.53,0.1,'#3B3F58',10,{ol:false}),0,0.3,0));b.add(at(cyl(0.53,0.53,0.1,'#3B3F58',10,{ol:false}),0,0.9,0));
    onGround(b,x,z);F(b,{k:'barrel',n:'a barrel',c:['brown'],s:'round',m:'wood',p:false});circ(x,z,0.55);});

  // anchor
  {const g=new THREE.Group();const c='#3B3F58';
   g.add(at(cyl(0.12,0.12,2.2,c,8),0,1.4,0));
   g.add(rot(at(cyl(0.1,0.1,1.3,c,8),0,2.2,0),0,0,Math.PI/2));
   const ring=mk(new THREE.TorusGeometry(0.22,0.07,6,12),c);ring.position.y=2.65;g.add(ring);
   const arc=mk(new THREE.TorusGeometry(0.85,0.12,6,14,Math.PI),c);arc.rotation.z=Math.PI;arc.position.y=0.9;g.add(arc);
   for(const s of[-1,1])g.add(rot(at(cone(0.2,0.4,c,4),0.85*s,1.05,0),0,0,-0.6*s));
   onGround(g,-4.5,41.5);g.rotation.y=0.4;
   F(g,{k:'anchor',n:'the big anchor',c:['dark grey'],s:'hooked',m:'iron',v:'deeply grounded',snd:'clank',u:'keep a ship from drifting',e:'⚓⛓️🌊',r:"I'm happiest when I've sunk all the way to the bottom."});
   circ(-4.5,41.5,0.9);}
  // fishing net
  {const nt=canvasTex(128,128,(x,W,H)=>{x.clearRect(0,0,W,H);x.strokeStyle='#F2E6C9';x.lineWidth=4;for(let i=0;i<=W;i+=16){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(W,i);x.stroke();}});
   const g=new THREE.Group();g.add(at(cyl(0.1,0.1,2.8,'#8B5E3C',6),-1.4,1.4,0));g.add(at(cyl(0.1,0.1,2.8,'#8B5E3C',6),1.4,1.4,0));
   const n=new THREE.Mesh(new THREE.PlaneGeometry(2.8,2,6,4),new THREE.MeshToonMaterial({map:nt,transparent:true,alphaTest:0.3,side:THREE.DoubleSide,gradientMap:gradTex}));n.position.y=1.5;g.add(n);
   g.add(at(sph(0.2,'#FF9F1C',8,6,{w:0.02}),0.4,0.8,0.05));
   onGround(g,-7.5,48);g.rotation.y=-0.2;
   F(g,{k:'fishing net',n:'the fishing net',c:['beige'],s:'flat and holey',m:'rope',v:'full of holes and fine with it',u:'catch a fish with',e:'🕸️🐟🙈',r:"I'm full of holes, yet I still hold things."});
   rect(-7.5,48,3,0.6);
   W.movers.push(t=>{const p=n.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.sin(t*2+x*2)*0.08*(1-y));}p.needsUpdate=true;});}
  // life ring on a post
  {const g=new THREE.Group();g.add(at(box(0.16,1.6,0.16,'#FFFFFF',{w:0.02}),0,0.8,0));
   const r=mk(new THREE.TorusGeometry(0.42,0.13,8,16),0,{mat:MT(stripeTex('#FF5D73','#FFFFFF',8))});r.position.set(0,1.1,0.18);g.add(r);
   g.position.set(1.95,0.56,57);g.rotation.y=Math.PI/2;scene.add(g);
   F(g,{k:'life ring',n:'the life ring',c:['red','white'],s:'round',m:'foam',v:'always ready to help',u:'throw to someone in the water',e:'🛟🆘🍩',r:"I look like a giant donut, but please don't eat me."});}
  // fisherman
  {const f=npc('#FFD23F','#FFD23F');f.position.set(-5,0.56,72.4);f.rotation.y=0;
   const rod=grp(rot(at(cyl(0.03,0.04,3.2,'#5B4B3A',5,{ol:false}),0,1.6,0),0,0,0));rod.position.set(0.45,1,0.2);rod.rotation.x=0.9;f.add(rod);
   const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(0,3.2,0),new V3(0,-1.2,1.6)]),new THREE.LineBasicMaterial({color:0xffffff}));rod.add(line);
   const bucket=grp(at(cyl(0.25,0.2,0.4,'#6BA3D6',8,{w:0.02}),0,0.2,0));bucket.position.set(-0.8,0,0);f.add(bucket);
   scene.add(f);
   F(f,{k:'fisherman',n:'the fisherman',c:['yellow'],s:'tall',m:'raincoat',v:'very, very patient',snd:'plop',u:'swap fishing stories with',e:'🎣⏳🐟'});
   W.movers.push(t=>{rod.rotation.x=0.9+Math.sin(t*0.9)*0.08;});}
  // beach: sandcastle, umbrella, ball
  {const a=2.0,r=shoreR(a)-7.6,x=Math.cos(a)*r,z=Math.sin(a)*r;const g=new THREE.Group();const s='#F2CD7E';
   g.add(at(box(1.8,0.6,1.8,s),0,0.3,0));for(const [dx,dz] of[[-0.8,-0.8],[0.8,-0.8],[-0.8,0.8],[0.8,0.8]]){g.add(at(cyl(0.3,0.35,1.1,s,8),dx,0.55,dz));g.add(at(cone(0.35,0.4,s,8),dx,1.3,dz));}
   g.add(at(cyl(0.5,0.6,1.1,s,8),0,1.1,0));g.add(at(box(0.04,0.6,0.04,'#2B2040',{ol:false}),0,1.9,0));g.add(at(box(0.35,0.22,0.02,'#FF5D73',{ol:false}),0.18,2.08,0));
   onGround(g,x,z);F(g,{k:'sandcastle',n:'the sandcastle',c:['tan'],s:'towery',m:'sand',v:'fragile but brave',u:'defend from the tide',e:'🏰🌊😰',r:'I have towers and a flag, but one big wave could end my kingdom.'});circ(x,z,1.3);}
  {const a=1.88,r=shoreR(a)-8.4,x=Math.cos(a)*r,z=Math.sin(a)*r;const g=new THREE.Group();
   g.add(rot(at(cyl(0.05,0.05,2.8,'#FFFFFF',6,{ol:false}),0,1.3,0),0,0,0.15));
   const top=mk(new THREE.ConeGeometry(1.8,0.8,10),0,{mat:MT(stripeTex('#2EC4B6','#FFFFFF',10))});top.position.set(-0.2,2.7,0);top.rotation.z=0.15;g.add(top);
   const towel=box(1,0.04,2,'#FF9F1C',{w:0.02});towel.position.set(1,0.03,0.4);g.add(towel);
   onGround(g,x,z);F(g,{k:'beach umbrella',n:'the beach umbrella',c:['teal','white'],s:'pointy',m:'canvas',v:'on permanent vacation',u:'nap in the shade under',e:'🏖️😎🌂'});}
  {const a=1.95,r=shoreR(a)-9.3,x=Math.cos(a)*r,z=Math.sin(a)*r;
   const b=mk(new THREE.SphereGeometry(0.4,12,8),0,{mat:MT(stripeTex('#FF5D73','#FFD23F',6))});b.position.set(x,landH(x,z)+0.4,z);scene.add(b);
   F(b,{k:'beach ball',n:'the beach ball',c:['red','yellow'],s:'round',m:'plastic',v:'bouncy',snd:'boing',u:'bop across the sand',e:'🏐🏖️🤾'});}

  // boats
  const sailboat=(cx,cz,col,cn,ph)=>{const g=new THREE.Group();
    const hull=new THREE.Group();hull.add(scl(at(sph(1,'#FFFFFF',12,6),0,0,0),1,0.5,2.6));hull.add(at(box(1.6,0.1,4,'#C8935E',{w:0.02}),0,0.35,0));g.add(hull);
    g.add(at(cyl(0.07,0.07,5,'#8B5E3C',6),0,2.8,0.2));
    const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(0,4.2);sh.lineTo(2,0);sh.lineTo(0,0);
    const sg=new THREE.ShapeGeometry(sh),sail=new THREE.Mesh(sg,new THREE.MeshToonMaterial({color:col,side:THREE.DoubleSide,gradientMap:gradTex}));sail.castShadow=true;
    sail.add(new THREE.LineSegments(new THREE.EdgesGeometry(sg),new THREE.LineBasicMaterial({color:0x2B2040})));
    sail.rotation.y=-Math.PI/2;sail.position.set(0,0.6,0.35);g.add(sail);
    scene.add(g);
    F(g,{k:'sailboat',n:`the ${cn}-sailed boat`,c:[cn,'white'],s:'pointy',m:'wood',v:'breezy',snd:'flap',u:'sail away on',e:'⛵🌬️🌊',mv:true});
    W.movers.push(t=>{const a=t*0.05+ph;g.position.set(cx+Math.cos(a)*6,-0.35+Math.sin(t*1.3+ph)*0.12,cz+Math.sin(a)*4);g.rotation.y=-a;g.rotation.z=Math.sin(t*1.1+ph)*0.06;});};
  sailboat(18,78,'#FF5D73','red',0); sailboat(-20,80,'#FFD23F','yellow',2.4);
  {const g=new THREE.Group();g.add(scl(sph(0.8,'#4D96FF',10,6),1,0.45,2));g.add(at(box(1.2,0.08,0.3,'#C8935E',{w:0.02}),0,0.2,0));
   for(const s of[-1,1])g.add(rot(at(cyl(0.04,0.04,2.4,'#8B5E3C',5,{ol:false}),0.9*s,0.2,0),0,0,s*1.2));
   scene.add(g);
   F(g,{k:'rowboat',n:'the blue rowboat',c:['blue'],s:'long',m:'wood',v:'quite lazy',snd:'creak',u:'row across the bay in',e:'🚣💤🌊',mv:true});
   W.movers.push(t=>{g.position.set(8.5+Math.sin(t*0.07)*1.5,-0.3+Math.sin(t*1.6)*0.1,62+Math.cos(t*0.05)*1.2);g.rotation.y=0.6+Math.sin(t*0.3)*0.2;});}
  // buoys
  [[10,83,'#FF3B3B','red'],[-12,85,'#3DDC97','green']].forEach(([x,z,c,cn],i)=>{const g=new THREE.Group();g.add(at(cyl(0.5,0.7,1,c,10),0,0,0));g.add(at(cone(0.5,0.9,c,10),0,0.95,0));g.add(at(sph(0.18,'#FFF2A8',6,5),0,1.5,0));
    scene.add(g);F(g,{k:'buoy',n:`the ${cn} buoy`,c:[cn],s:'pointy',m:'metal',v:'bobbing along without a care',snd:'ding-ding',u:'mark the safe channel',e:'🌊🔺🛎️',mv:true});
    W.movers.push(t=>{g.position.set(x,-0.2+Math.sin(t*1.8+i)*0.18,z);g.rotation.z=Math.sin(t*1.3+i)*0.12;});});
  // ferry on a schedule
  {const g=new THREE.Group();
   g.add(scl(at(box(3.6,1.4,9,'#FFFFFF'),0,0,0),1,1,1));g.add(at(box(3.7,0.3,9.1,'#FF5D73'),0,-0.55,0));
   g.add(at(box(3,1.6,5,'#4D96FF'),0,1.5,-0.5));for(let i=0;i<4;i++)g.add(at(box(0.08,0.6,0.8,'#BFE9FF',{ol:false}),1.52,1.6,-2.4+i*1.3));
   g.add(at(cyl(0.45,0.55,1.4,'#FFD23F',10),0,3,-1.8));g.add(at(cyl(0.47,0.47,0.3,'#2B2040',10,{ol:false}),0,3.6,-1.8));
   scene.add(g);
   F(g,{k:'ferry',n:'the ferry',c:['white','blue'],s:'long',m:'steel',v:'punctual to the second',snd:'HOOONK',u:'catch a ride to the mainland on',e:'⛴️🕐🧳',r:"I come and go on a strict schedule, and I'm always carrying passengers.",mv:true});
   const path=loopPath([{p:[70,-0.1,170],d:30},{p:[9.8,-0.1,72.5],d:30},{p:[9.8,-0.1,72.5],d:28},{p:[-80,-0.1,160],d:40},{p:[-80,-0.1,160],d:2},{p:[70,-0.1,170],d:0.01}]);
   const tmp=new V3();
   W.movers.push(t=>{const r=path(t,tmp);g.position.set(tmp.x,tmp.y+Math.sin(t*1.2)*0.1,tmp.z);if(r.moving)g.rotation.y=Math.atan2(r.dx,r.dz);});}
  // seagull
  {const g=new THREE.Group();g.add(scl(sph(0.3,'#FFFFFF',8,6),0.8,0.8,1.6));g.add(at(sph(0.2,'#FFFFFF',8,6),0,0.12,0.45));g.add(rot(at(cone(0.06,0.2,'#FF9F1C',5,{ol:false}),0,0.1,0.7),Math.PI/2,0,0));
   const wl=grp(at(box(1.2,0.05,0.4,'#F4F4F8',{w:0.02}),-0.6,0,0)),wr=grp(at(box(1.2,0.05,0.4,'#F4F4F8',{w:0.02}),0.6,0,0));g.add(wl,wr);scene.add(g);
   F(g,{k:'seagull',n:'the seagull',c:['white'],s:'flappy',m:'feathers',v:'loud and a bit rude',snd:'SQUAWK',u:'guard your chips from',e:'🐦🍟😠',r:'I circle the harbor looking for chips to steal.',mv:true});
   W.movers.push(t=>{const a=t*0.4;g.position.set(4+Math.cos(a)*11,12+Math.sin(t*0.7)*1.5,56+Math.sin(a)*9);g.rotation.y=-a;g.rotation.z=0.3;const f=Math.sin(t*6)*0.5;wl.rotation.z=f;wr.rotation.z=-f;});}
  // jumping fish
  {const g=new THREE.Group();g.add(scl(sph(0.3,'#FF9F1C',8,6),0.6,0.8,1.6));g.add(rot(at(cone(0.3,0.4,'#FF9F1C',3),0,0,-0.6),-Math.PI/2,0,0));scene.add(g);
   F(g,{k:'fish',n:'the jumping fish',c:['orange'],s:'long',m:'scales',v:'showing off',snd:'splash',e:'🐟⬆️💦',r:'I leap out of the water for a split second, then vanish again.',mv:true});
   W.movers.push(t=>{const u=t%7;if(u<1.4){g.visible=true;const f=u/1.4;g.position.set(11+f*3,-0.5+Math.sin(f*Math.PI)*3.2,66);g.rotation.x=lerp(-1,1,f);}else{g.visible=false;}});}
  // crab scuttling sideways on the beach
  {const g=new THREE.Group();g.add(scl(sph(0.35,'#FF4B3E',8,6),1.3,0.6,1));
   for(const s of[-1,1]){g.add(at(sph(0.14,'#FF4B3E',6,5),0.55*s,0.12,0.3));g.add(at(cyl(0.03,0.03,0.25,'#FF4B3E',4,{ol:false}),0.12*s,0.3,0.2));g.add(at(sph(0.06,'#FFFFFF',5,4,{ol:false,shadow:false}),0.12*s,0.44,0.2));}
   scene.add(g);
   F(g,{k:'crab',n:'the crab',c:['red'],s:'wide and flat',m:'shell',v:'shifty',snd:'click-click',u:'avoid stepping on',e:'🦀↔️🏖️',r:'I walk sideways and pinch first, ask questions later.',mv:true});
   W.movers.push(t=>{const a=2.1+Math.sin(t*0.18)*0.22;const r=shoreR(a)-6.6;const x=Math.cos(a)*r,z=Math.sin(a)*r;g.position.set(x,landH(x,z)+0.2+Math.abs(Math.sin(t*9))*0.04,z);g.rotation.y=-a;});}
}

