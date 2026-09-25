/* =========================================================
   Market Street
   ========================================================= */
function buildMarket(){
  const road=MT(canvasTex(128,128,(x,W,H)=>{x.fillStyle='#E2CDB0';x.fillRect(0,0,W,H);x.strokeStyle='#CDB392';x.lineWidth=3;for(let i=0;i<4;i++){x.strokeRect(i%2?-16:0,i*32,64,32);x.strokeRect(i%2?48:64,i*32,64,32);}}));
  road.map.wrapS=road.map.wrapT=THREE.RepeatWrapping;
  ribbon(dense([[13,0],[57,0]],1),8,road,false,0.06);
  ribbon(dense([[0,13],[0,50]],1),5,road,false,0.06);
  ribbon(dense([[0,-13],[0,-36]],1),5,road,false,0.06);
  ribbon(dense([[-13,0],[-30,0]],1),5,road,false,0.06);

  const stall=(x,side,a,b)=>{const z=4.8*side;const g=new THREE.Group();
    g.add(at(box(3.6,0.9,1.6,'#C8935E'),0,0.45,0));
    for(const sx of[-1,1])for(const sz of[-1,1])g.add(at(cyl(0.07,0.07,2.7,'#8B5E3C',6),1.7*sx,1.35,0.7*sz));
    const aw=mk(new THREE.BoxGeometry(4.1,0.14,2.3),0,{mat:MT(stripeTex(a,b,8))});aw.position.set(0,2.75,0);aw.rotation.x=0.15*-side;g.add(aw);
    onGround(g,x,z); F(g,{k:'stall',n:'a market stall',c:[],s:'boxy',m:'wood',p:false}); rect(x,z,3.8,1.8);
    return landH(x,z)+0.9;};
  const tops={};
  [[18,-1,'#FF5D73','#FFFFFF'],[32,-1,'#FF9F1C','#FFF3D6'],[39,-1,'#FFD23F','#FFFFFF'],[46,-1,'#3DDC97','#FFFFFF'],
   [18,1,'#4D96FF','#FFFFFF'],[32,1,'#B08968','#F7E7CE'],[39,1,'#F15BB5','#FFFFFF'],[46,1,'#2EC4B6','#FFFFFF']].forEach(([x,s,a,b])=>{tops[x+'_'+s]=stall(x,s,a,b);});
  const put=(g,x,s,meta,dx)=>{g.position.set(x+(dx||0),tops[x+'_'+s],4.8*s);F(g,meta);};
  // apples
  {const g=new THREE.Group();[[0,0],[0.35,0],[-0.35,0],[0.17,0.3],[-0.17,0.3],[0,0.15]].forEach(([x,z],i)=>g.add(at(sph(0.18,'#E8323F',8,6,{w:0.025}),x,0.18+(i>4?0.26:0),z-0.1)));
   put(g,18,-1,{k:'apples',n:'the pile of apples',c:['red'],s:'round',m:'fruit',v:'crisp and confident',snd:'crunch',u:'bake into a pie',e:'🍏➡️🔴🥧'},-0.8);}
  // oranges
  {const g=new THREE.Group();[[0,0],[0.36,0],[-0.36,0],[0.18,0.3],[-0.18,0.3],[0,0.14]].forEach(([x,z],i)=>g.add(at(sph(0.18,'#FF9F1C',8,6,{w:0.025}),x,0.18+(i>4?0.26:0),z-0.1)));
   put(g,32,-1,{k:'oranges',n:'the orange pyramid',c:['orange'],s:'round',m:'fruit',v:'zesty',u:'squeeze into juice',e:'🔺🧃☀️'},0.6);}
  // bananas
  {const g=new THREE.Group();for(let i=0;i<4;i++){const b=mk(new THREE.TorusGeometry(0.35,0.075,5,10,Math.PI*0.7),'#FFE14D',{w:0.02});b.rotation.set(Math.PI/2,0,i*0.25);b.position.set(i*0.12-0.2,0.08,0);g.add(b);}
   put(g,39,-1,{k:'bananas',n:'the bunch of bananas',c:['yellow'],s:'curved',m:'fruit',v:'a little slippery',u:'peel and snack on',e:'🐒🌙💛',r:'Monkeys love me, and my skin is a famous trap.'});}
  // watermelon
  {const g=new THREE.Group();g.add(scl(at(sph(0.5,'#3E9E4A',12,8),0,0.4,0),1.3,0.9,1));
   const sl=mk(new THREE.CylinderGeometry(0.4,0.4,0.12,12,1,false,0,Math.PI),'#FF5D73',{w:0.02});sl.rotation.set(Math.PI/2,0,0);sl.position.set(0.9,0.15,0.2);g.add(sl);
   put(g,46,-1,{k:'watermelon',n:'the watermelon',c:['green','red'],s:'round',m:'fruit',v:'refreshingly chill',snd:'thunk',u:'slice up for a picnic',e:'🟢➡️🔴🌰',r:"I'm green outside, red inside, and full of little black seeds."},-0.5);}
  // fish on ice
  {const g=new THREE.Group();g.add(at(box(2.2,0.2,1,'#E6F7FF'),0,0.1,0));
   for(let i=0;i<3;i++){const f=new THREE.Group();f.add(scl(at(sph(0.2,'#8FB7D6',8,6,{w:0.02}),0,0,0),2.2,0.6,0.8));f.add(rot(at(cone(0.16,0.25,'#6E97BA',3,{w:0.02}),-0.55,0,0),0,0,Math.PI/2));f.position.set(i*0.6-0.6,0.3,0);g.add(f);}
   put(g,18,1,{k:'fish',n:'the fish on ice',c:['silver','blue'],s:'long',m:'scales',v:'extremely chilled out',snd:'flop',u:'fry up for dinner',e:'🧊🐟😎'});}
  // baguettes
  {const g=new THREE.Group();g.add(at(cyl(0.4,0.3,0.4,'#B5793A',10),0,0.2,0));for(let i=0;i<4;i++)g.add(rot(at(cyl(0.08,0.08,1.1,'#E8B26A',6,{w:0.02}),Math.cos(i*1.6)*0.15,0.7,Math.sin(i*1.6)*0.15),Math.cos(i)*0.25,0,Math.sin(i)*0.25));
   put(g,32,1,{k:'baguettes',n:'the basket of baguettes',c:['brown','tan'],s:'long',m:'bread',v:'fresh and a bit crusty',snd:'crunch',u:'tear up and share',e:'🇫🇷🥖🧺'},-0.6);}
  // flower buckets
  {const g=new THREE.Group();[['#F15BB5',-0.5],['#FFD23F',0.2],['#9B5DE5',0.8]].forEach(([c,x])=>{g.add(at(cyl(0.22,0.18,0.4,'#6BA3D6',8,{w:0.02}),x,0.2,0));for(let i=0;i<5;i++)g.add(at(sph(0.1,c,6,4,{w:0.02}),x+Math.cos(i*1.3)*0.14,0.62+(i%2)*0.1,Math.sin(i*1.3)*0.14));});
   put(g,39,1,{k:'flowers',n:'the flower buckets',c:['pink','yellow','purple'],s:'bunched up',m:'petals',v:'romantic',u:'give to someone you like',e:'💐💘🪣'});}
  // teapot
  {const g=new THREE.Group();g.add(scl(at(sph(0.35,'#2EC4B6',12,8),0,0.32,0),1,0.85,1));g.add(at(sph(0.1,'#2EC4B6',6,4),0,0.65,0));
   g.add(rot(at(cyl(0.05,0.09,0.4,'#2EC4B6',6),0.42,0.4,0),0,0,-0.9));const h=mk(new THREE.TorusGeometry(0.16,0.04,5,10),'#2EC4B6',{w:0.02});h.position.set(-0.38,0.35,0);g.add(h);
   put(g,46,1,{k:'teapot',n:'the teapot',c:['teal'],s:'round',m:'china',v:'a bit steamed',snd:'whistle',u:'pour a cuppa from',e:'🫖☕💨',r:'Tip me over and pour me out, but only when I start to whistle.'},0.6);}
  // cheese wheel
  {const g=new THREE.Group();g.add(at(cyl(0.45,0.45,0.28,'#FFD23F',14),0,0.14,0));
   const w=mk(new THREE.CylinderGeometry(0.45,0.45,0.28,8,1,false,0,0.7),'#FFE680',{w:0.02});w.position.set(0.4,0.14,0.2);g.add(w);
   put(g,46,1,{k:'cheese',n:'the wheel of cheese',c:['yellow'],s:'round',m:'dairy',v:'a bit smelly but proud',snd:'squeak',u:'nibble like a mouse',e:'🐭🎡🟡'},-0.9);}
  // pumpkins on the ground
  {const g=new THREE.Group();[[0,0,0.45],[0.8,0.3,0.32],[-0.6,0.4,0.28]].forEach(([x,z,r])=>{g.add(scl(at(sph(r,'#FF8C1A',10,6),x,r*0.7,z),1.2,0.8,1.2));g.add(at(cyl(0.04,0.05,0.18,'#3E9E4A',5,{ol:false}),x,r*1.35,z));});
   onGround(g,35.5,-7); F(g,{k:'pumpkins',n:'the pumpkin pile',c:['orange'],s:'round',m:'squash',v:'spooky but friendly',u:'carve a face into',e:'🎃🧡🕯️'}); circ(35.5,-7,1);}

  // shops
  const shop=(x,side,body,roof,label,labCol,meta,extra)=>{const z=11.5*side;const g=new THREE.Group();
    g.add(at(box(7,4.4,5,body),0,2.2,0));
    const r=mk(prismGeo(7.6,2.4,5.6),roof);r.position.y=4.4;g.add(r);
    g.add(at(box(1.3,2.1,0.2,'#8A5A44',{w:0.03}),-1.8,1.05,2.55));
    g.add(at(box(2.6,1.5,0.15,'#BFE9FF',{w:0.03}),1.3,1.7,2.55));
    const aw=mk(new THREE.BoxGeometry(3.2,0.12,1.3),0,{mat:MT(stripeTex(roof,'#FFFFFF',8))});aw.position.set(1.3,2.75,3.1);aw.rotation.x=0.35;g.add(aw);
    const s=signBox(label,4.8,0.8,labCol,'#2B2040');s.position.set(0,3.92,2.66);g.add(s);   // high enough to clear the stall awnings
    if(extra) extra(g);
    onGround(g,x,z); g.rotation.y=side>0?Math.PI:0; F(g,meta); rect(x,z,7.2,5.2); return g;};
  shop(33,-1,'#FFD6DC','#E84A6F','Knead to Know','#FFF3D6',{k:'bakery',n:'the Knead to Know bakery',c:['pink'],s:'boxy',m:'brick',v:'warm and toasty',snd:'ding',u:'buy a fresh bun at',e:'🥐🔥🏠'},g=>{
    const pz=new THREE.Group();const pr=mk(new THREE.TorusGeometry(0.45,0.14,6,12),'#C8782F');pz.add(pr);const p2=mk(new THREE.TorusGeometry(0.28,0.12,6,10),'#C8782F');p2.position.set(0,-0.2,0);pz.add(p2);
    pz.position.set(3.7,3.2,2.2);g.add(pz);g.add(at(box(0.8,0.08,0.08,'#2B2040',{ol:false}),3.4,3.8,2.2));
    W.movers.push(t=>{pz.rotation.y=t*1.5;});});
  shop(42,-1,'#CFE4FF','#3F6FB5','Curl Up & Dye','#FFFFFF',{k:'barbershop',n:'the Curl Up & Dye barbershop',c:['blue'],s:'boxy',m:'brick',v:'very well groomed',snd:'snip-snip',u:'get a fresh haircut at',e:'✂️💇😎'},g=>{
    const tex=stripeTex('#FF3B5C','#FFFFFF',6);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.rotation=0.5;
    const pole=mk(new THREE.CylinderGeometry(0.2,0.2,1.6,12),0,{mat:MT(tex)});pole.position.set(-3.2,2.2,2.7);g.add(pole);
    g.add(at(sph(0.22,'#4D96FF',8,6),-3.2,3.1,2.7));
    W.movers.push(t=>{tex.offset.x=(t*0.5)%1;});});
  shop(51,-1,'#E3D5FF','#6B4FC8','Frock & Roll','#FFD23F',{k:'clothes shop',n:'the Frock & Roll clothes shop',c:['lavender','purple'],s:'boxy',m:'brick',v:'fancy',u:'spend your coins on clothes at',e:'👗👟🧣',r:'I have a giant T-shirt on my roof, and I’ll dress you for a few coins.'},g=>{
    // a giant T-shirt on the roof
    const tee=new THREE.Group();tee.add(at(box(1.9,2,0.35,'#FF5D73',{w:0.05}),0,0,0));
    for(const s of[-1,1])tee.add(rot(at(box(1,0.75,0.35,'#FF5D73',{w:0.05}),1.2*s,0.55,0),0,0,-0.55*s));
    tee.add(at(box(0.7,0.14,0.37,'#FFFFFF',{ol:false}),0,0.95,0));tee.add(at(box(1.9,0.22,0.37,'#FFFFFF',{ol:false}),0,-0.3,0));
    tee.position.set(0,7.9,0);g.add(tee);});
  shop(33,1,'#C9F2E1','#2F9E8F','The Codfather','#FFFFFF',{k:'fish shop',n:'the Codfather fish shop',c:['mint','teal'],s:'boxy',m:'brick',v:'a little salty',snd:'splash',u:'buy fresh fish at',e:'🐟🏪🧊'});
  shop(42,1,'#FFF0B3','#F29D38','Just Toying','#FF5D73',{k:'toy shop',n:'the Just Toying toy shop',c:['yellow','orange'],s:'boxy',m:'brick',v:'giddy',snd:'squeak',u:'buy a wind-up toy at',e:'🧸🪀🎁'},g=>{
    const t=new THREE.Group();t.add(at(box(0.6,0.6,0.6,'#FF5D73',{w:0.02}),0,0,0));t.add(at(box(0.6,0.6,0.6,'#4D96FF',{w:0.02}),0.62,0,0));t.add(at(box(0.6,0.6,0.6,'#FFD23F',{w:0.02}),0.31,0.6,0));
    t.position.set(0.8,1.3,2.9);g.add(t);});
  shop(51,1,'#FFE0F0','#D65DB1','Petal Pushers','#FFFFFF',{k:'florist',n:'the Petal Pushers flower shop',c:['pink'],s:'boxy',m:'brick',v:'blooming lovely',u:'order a bouquet at',e:'🌸🏪💐'},g=>{
    for(let i=0;i<5;i++){g.add(at(box(0.5,0.4,0.5,'#B5654C',{w:0.02}),-3+i*1.5,0.2,3.2));g.add(at(sph(0.3,['#FF5D73','#FFD23F','#F15BB5','#9B5DE5','#FF9F1C'][i],6,5,{w:0.02}),-3+i*1.5,0.62,3.2));}});

  // blue butterfly + friends
  const bfly=(c,cx,cz,uniq,i)=>{const g=new THREE.Group();const wm=new THREE.MeshToonMaterial({color:c,side:THREE.DoubleSide,gradientMap:gradTex});
    const wl=new THREE.Mesh(new THREE.CircleGeometry(0.28,6),wm),wr=new THREE.Mesh(new THREE.CircleGeometry(0.28,6),wm);
    wl.position.x=-0.25;wr.position.x=0.25;const lp=grp(wl),rp=grp(wr);g.add(lp,rp);g.add(at(cyl(0.04,0.04,0.35,'#2B2040',5,{ol:false}),0,0,0));
    g.children[2].rotation.x=Math.PI/2; scene.add(g);
    F(g,uniq?{k:'butterfly',n:'the blue butterfly',c:['blue'],s:'flappy',m:'wings',v:'daydreamy',e:'🐛➡️🦋',r:'I used to be a caterpillar. Now look at me.',mv:true}:{k:'butterfly',n:'a butterfly',c:[],s:'flappy',m:'wings',p:false,mv:true});
    W.movers.push(t=>{const u=t*0.4+i*2;g.position.set(cx+Math.sin(u)*3+Math.sin(u*2.3),landH(cx,cz)+1.6+Math.sin(u*3)*0.5,cz+Math.cos(u*0.8)*2.4);
      const f=Math.sin(t*18+i)*1.1;lp.rotation.z=f;rp.rotation.z=-f;lp.rotation.x=rp.rotation.x=-Math.PI/2;g.rotation.y=u;});};
  bfly('#4D96FF',25,-8,true,0); bfly('#FFD23F',40,7.5,false,1); bfly('#F15BB5',-40,18,false,2); bfly('#FF9F1C',-24,-6,false,3);
  // flower pots along the street (on the grass, clear of the road and the paving)
  [[21,-8],[30.5,-8.4],[21,8],[30.5,8.4],[53.5,-7.6],[53.5,7.6]].forEach(([x,z],i)=>{const g=new THREE.Group();g.add(at(cyl(0.45,0.35,0.6,'#C8703F',8),0,0.3,0));g.add(at(sph(0.5,'#4CB85A',7,5),0,0.9,0));g.add(at(sph(0.15,['#FF5D73','#FFD23F','#F15BB5'][i%3],5,4,{w:0.02}),0.2,1.25,0.2));
    onGround(g,x,z);F(g,{k:'pot',n:'a flower pot',c:['green'],s:'round',m:'clay',p:false});circ(x,z,0.5);});
}

