/* =========================================================
   Windmill Green: the hillside neighbourhood gets a back lane
   with lamps, fenced back gardens, and a little village green
   (post office, sundial, notice board) beside tulip fields
   that run up to the windmill
   ========================================================= */
function cobbleTex(){
  const t=canvasTex(128,128,(x,W,H)=>{x.fillStyle='#CFC4B0';x.fillRect(0,0,W,H);
    for(let r=0;r<8;r++)for(let c=0;c<5;c++){const ox=(r%2)*13;x.fillStyle=['#E6DCC8','#DDD1BB','#EFE6D4','#D6CAB2'][(r*3+c)%4];rrect(x,c*26+ox-10,r*16+2,22,12,4);x.fill();}});
  t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
function lampPost(x,z){
  const g=new THREE.Group();g.add(at(cyl(0.08,0.12,3.2,'#2B2040',6),0,1.6,0));g.add(at(box(0.5,0.06,0.06,'#2B2040',{ol:false}),0.2,3.1,0));
  g.add(at(sph(0.24,'#FFF2B3',8,6),0.42,2.85,0));g.add(at(cone(0.3,0.26,'#2B2040',6,{w:0.02}),0.42,3.12,0));
  onGround(g,x,z);F(g,{k:'lamp',n:'a lamp post',c:['black'],s:'tall and skinny',m:'iron',p:false});circ(x,z,0.25);return g;
}
// a white picket fence along a list of corners (open=true leaves the last side off)
function picket(pts,col){
  const g=new THREE.Group();col=col||'#FFFFFF';const y0=landH(pts[0][0],pts[0][1]);
  for(let i=0;i<pts.length-1;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],L=Math.hypot(bx-ax,bz-az),a=Math.atan2(bz-az,bx-ax);
    for(const y of[0.35,0.7]){const b=box(L,0.08,0.05,col,{ol:false});b.position.set((ax+bx)/2,landH((ax+bx)/2,(az+bz)/2)-y0+y,(az+bz)/2);b.rotation.y=-a;g.add(b);}
    const n=Math.max(1,Math.round(L/0.38));
    for(let k=0;k<n;k++){const px=lerp(ax,bx,(k+0.5)/n),pz=lerp(az,bz,(k+0.5)/n);const p=grp(at(box(0.12,0.8,0.05,col,{ol:false}),0,0.4,0),rot(at(box(0.085,0.085,0.05,col,{ol:false}),0,0.8,0),0,0,Math.PI/4));
      p.position.set(px,landH(px,pz)-y0,pz);p.rotation.y=-a;g.add(p);}}
  g.position.y=y0;scene.add(g);F(g,{k:'fence',n:'a picket fence',c:['white'],s:'long',m:'wood',p:false});return g;
}
function buildVillage(){
  const cob=MT(cobbleTex());
  // a small tree in each gap along the row of houses
  for(const x of[-15.75,-5.25,5.25,15.75])leafyTree(x,-39.6,{s:0.72});
  buildHilltop();

  /* ---------- Windmill Green ---------- */
  const GC=[46,-20.5];
  {const dg=new THREE.RingGeometry(0,5.4,36,8);dg.rotateX(-Math.PI/2);const p=dg.attributes.position;   // paving that follows the slope
   for(let i=0;i<p.count;i++)p.setY(i,landH(GC[0]+p.getX(i),GC[1]+p.getZ(i))+0.08);dg.computeVertexNormals();
   const disc=new THREE.Mesh(dg,MT(cobbleTex()));disc.material.map.repeat.set(3,3);
   disc.position.set(GC[0],0,GC[1]);disc.receiveShadow=true;scene.add(disc);W.pickables.push(disc);}
  ribbon(dense([[25,-14.2],[31,-16.2],[37,-18.6],[41.2,-19.8]],1.2),2.6,cob,false,0.055);
  ribbon(dense([[41.5,-22.4],[35,-23.4],[30.5,-25.6],[27.4,-29.8]],1.2),2.4,cob,false,0.055);
  // sundial in the middle
  {const g=new THREE.Group();g.add(at(cyl(0.55,0.7,0.35,'#CFC9DD',12),0,0.17,0));g.add(at(cyl(0.3,0.42,0.8,'#E6E0F0',10),0,0.75,0));
   g.add(at(cyl(0.62,0.62,0.1,'#E3B04B',16),0,1.2,0));g.add(rot(at(mk(prismGeo(0.6,0.45,0.05),'#B8862E'),0,1.25,0),0,Math.PI/2,0));
   for(let i=0;i<12;i++){const a=i/12*TAU;g.add(at(box(0.04,0.02,0.12,'#2B2040',{ol:false}),Math.cos(a)*0.5,1.26,Math.sin(a)*0.5));}
   place(g,GC[0],GC[1],0.75,{k:'sundial',n:'the sundial',c:['gold','grey'],s:'round',m:'stone',v:'patient as the sun',u:'tell the time with a shadow on',e:'☀️🕰️🪨',
     r:['I tell the time without any hands, just a shadow.','I stop working the moment a cloud comes along.']},{exact:true});}
  // notice board
  {const g=new THREE.Group();for(const s of[-1,1])g.add(at(box(0.14,2.1,0.14,'#8B5E3C'),0.9*s,1.05,0));
   const t=canvasTex(256,160,(x,W,H)=>{x.fillStyle='#C8935E';x.fillRect(0,0,W,H);
     [['#FFFFFF',14,14,70,54,-0.06],['#FFD23F',98,20,64,50,0.05],['#BFE9FF',176,10,66,60,-0.03],['#FFB3C7',30,86,80,56,0.04],['#DFF7C8',128,90,96,54,-0.05]].forEach(([c,px,py,w,h,a])=>{
       x.save();x.translate(px+w/2,py+h/2);x.rotate(a);x.fillStyle=c;x.fillRect(-w/2,-h/2,w,h);x.fillStyle='#8A7F9E';for(let l=0;l<3;l++)x.fillRect(-w/2+8,-h/2+12+l*12,w-16-l*8,4);x.fillStyle='#FF3B5C';x.beginPath();x.arc(0,-h/2+5,4,0,TAU);x.fill();x.restore();});});
   const b=new THREE.Mesh(new THREE.BoxGeometry(1.9,1.2,0.1),[M('#8B5E3C'),M('#8B5E3C'),M('#8B5E3C'),M('#8B5E3C'),MT(t),M('#8B5E3C')]);b.position.y=1.5;b.castShadow=true;outline(b,0.03);g.add(b);
   g.add(rot(at(mk(prismGeo(2.2,0.45,0.5),'#7A2E2E'),0,2.15,0),0,0,0));
   place(g,GC[0]-3.4,GC[1]-4.3,0.9,{k:'notice board',n:'the notice board',c:['brown'],s:'flat',m:'cork',v:'full of news',u:'pin a lost-cat poster on',e:'📌📋🐈',
     r:['Pin your news on me and the whole village will read it.']},{exact:true,ry:0.6});}
  // benches and lamps around the green
  [[-4.6,1.8,2.0],[1.2,4.9,Math.PI],[3.6,-3.6,-0.8]].forEach(([dx,dz,ry])=>{const g=new THREE.Group();g.add(at(box(2,0.14,0.6,'#4CB85A'),0,0.55,0));g.add(at(box(2,0.5,0.1,'#4CB85A'),0,0.9,-0.28));
    for(const s of[-1,1])g.add(at(box(0.1,0.55,0.55,'#2B2040',{w:0.02}),0.85*s,0.27,0));onGround(g,GC[0]+dx,GC[1]+dz);g.rotation.y=ry;F(g,{k:'bench',n:'a bench',c:['green'],s:'long',m:'wood',p:false});circ(GC[0]+dx,GC[1]+dz,1);});
  for(const [dx,dz] of[[-5.8,-1.2],[4.8,3.6],[0.8,-5.8]])lampPost(GC[0]+dx,GC[1]+dz);
  // post office facing the green, and its post box
  {const g=new THREE.Group();const w=5.6,d=4.6,h=3.8;
   g.add(at(box(w,h,d,'#FFF1D6'),0,h/2,0));g.add(at(box(w+0.24,0.4,d+0.24,'#B8B2C8',{w:0.03}),0,0.2,0));
   const r=mk(prismGeo(w+0.6,1.8,d+0.6),'#C8323F');r.position.y=h;g.add(r);
   g.add(at(box(w+0.1,0.8,0.12,'#C8323F'),0,h-0.4,d/2+0.02));
   const s=signBox('Snail Mail',3.6,0.55,'#C8323F','#FFFFFF');s.position.set(0,h-0.4,d/2+0.12);g.add(s);
   g.add(at(box(1.45,2.25,0.14,'#FFFFFF',{w:0.03}),-1.3,1.12,d/2+0.03));g.add(at(box(1.1,1.95,0.14,'#2E5AAC',{w:0.02}),-1.3,1.02,d/2+0.08));
   g.add(at(box(1.8,0.22,0.8,'#CFC9DD',{w:0.02}),-1.3,0.11,d/2+0.4));
   houseWindow(g,1.2,1.7,d/2+0.06,0,'#2E5AAC',true);
   for(const sd of[-1,1])houseWindow(g,sd*(w/2+0.06),1.8,0,sd*Math.PI/2,null,false);
   g.add(rot(at(cyl(0.34,0.34,0.08,'#FFD23F',14,{w:0.02}),1.2,h+0.7,d/2+0.32),Math.PI/2,0,0));
   place(g,GC[0]+10,GC[1]-0.5,3.1,{k:'post office',n:'the Snail Mail post office',c:['cream','red'],s:'boxy',m:'brick',v:'busy with parcels',snd:'thump (stamp!)',u:'post a parcel at',e:'🏤✉️📦',
     r:['Letters and parcels start their journey inside me.','I sell stamps and send your birthday cards on their way.']},{exact:true,ry:-Math.PI/2});
   rect(GC[0]+10,GC[1]-0.5,d+0.3,w+0.3);}
  {const g=G_(at(cyl(0.34,0.38,1.3,'#D8232F',12),0,0.65,0),at(sph(0.36,'#D8232F',12,6),0,1.3,0),at(box(0.4,0.07,0.1,'#2B2040',{ol:false}),0,1.08,0.33),
     at(cyl(0.44,0.44,0.1,'#2B2040',12,{w:0.02}),0,0.05,0),at(box(0.28,0.16,0.05,'#FFFFFF',{ol:false}),0,0.8,0.36));
   place(g,GC[0]+6.2,GC[1]+4.6,0.45,{k:'post box',n:'the red post box',c:['red'],s:'round',m:'metal',v:'hungry for letters',snd:'clunk',u:'post a letter into',e:'📮✉️🔴',
     r:['I have a mouth for letters but I never read a single one.']},{exact:true,ry:-Math.PI/2});}
  // a rose arch where the path leaves the ring road
  {const g=new THREE.Group();for(const s of[-1,1])g.add(at(box(0.14,2.3,0.14,'#FFFFFF',{w:0.02}),1.05*s,1.15,0));
   const arch=mk(new THREE.TorusGeometry(1.05,0.07,6,16,Math.PI),'#FFFFFF',{w:0.02});arch.position.y=2.3;g.add(arch);
   for(let i=0;i<13;i++){const a=i/12*Math.PI;const px=Math.cos(a)*1.05,py=2.3+Math.sin(a)*1.05;g.add(at(sph(0.2,'#4FA548',6,5,{ol:false}),px,py,0.05));if(i%2===0)g.add(at(sph(0.13,i%4?'#FF5D73':'#FFB3C7',6,5,{ol:false}),px,py+0.05,0.18));}
   for(const s of[-1,1])for(let k=0;k<4;k++){g.add(at(sph(0.16,'#4FA548',6,5,{ol:false}),1.05*s+0.05,0.5+k*0.5,0.08));if(k%2)g.add(at(sph(0.11,'#FF5D73',6,5,{ol:false}),1.05*s,0.6+k*0.5,0.2));}
   place(g,29.2,-15.6,0.3,{k:'rose arch',n:'the rose arch',c:['white','red'],s:'arched',m:'wood',v:'romantic',u:'walk through on the way to the green',e:'🌹🚪💐',
     r:['Walk under me and I’ll shower you with the smell of roses.']},{exact:true,ry:Math.PI/2+0.32,solid:false});
   for(const s of[-1,1])circ(29.2-0.33*s,-15.6-1*s,0.2);}
  // tulip field in coloured bands, running up to the windmill
  {const x0=33,x1=47,z0=-31,z1=-25.4,cx=(x0+x1)/2,cz=(z0+z1)/2,g=new THREE.Group(),bands=['#FF3B5C','#FFD23F','#FF8FBF','#FFFFFF','#B39DFF','#FF9F1C'];
   const stemG=new THREE.CylinderGeometry(0.025,0.03,0.5,4);stemG.translate(0,0.25,0);
   const cup=new THREE.CylinderGeometry(0.12,0.07,0.2,6);cup.translate(0,0.58,0);
   const list=[],cols=[];let row=0;
   for(let z=z0;z<=z1+1e-6;z+=0.8,row++){const r=box(x1-x0,0.12,0.5,'#8E6A48',{ol:false,shadow:false});r.position.set(0,landH(cx,z)+0.04,z-cz);g.add(r);
     for(let x=x0+0.3;x<=x1-0.3;x+=0.32){const jx=x+sr(-0.06,0.06),jz=z+sr(-0.1,0.1);list.push([jx-cx,landH(jx,jz)+0.08,jz-cz,srand()*TAU,sr(0.85,1.15)]);cols.push(bands[row%bands.length]);}}
   g.add(inst(stemG,M('#4E9E3E'),list,false));
   const heads=inst(cup,new THREE.MeshToonMaterial({color:'#FFFFFF',gradientMap:gradTex}),list,false);cols.forEach((c,i)=>heads.setColorAt(i,new THREE.Color(c)));heads.instanceColor.needsUpdate=true;g.add(heads);
   g.position.set(cx,0,cz);scene.add(g);
   F(g,{k:'tulip field',n:'the tulip field',c:['red','yellow','pink'],s:'stripy',m:'flowers',v:'bursting with colour',u:'pick a spring bouquet from',e:'🌷🌈🌬️',
     r:['We grow in stripes of every colour beside the windmill.','Our cups point up to the sky, and we come back every spring.']});
   W.spots.push({x:cx,z:cz,r:7.5});}
  // a few trees to frame the green
  for(const [x,z] of[[36,-15.5],[55.5,-14.2],[40,-35],[57,-28],[51,-29.5]])if(!blocked(x,z,1.2,true))leafyTree(x,z);
}

/* ---------- the hilltop campsite, where the back row of houses used to be ---------- */
function buildHilltop(){
  // tent
  {const g=new THREE.Group();const tent=mk(prismGeo(2.6,2,3),'#FF9F1C');g.add(tent);
   g.add(at(box(0.9,1.3,0.05,'#2B2040',{ol:false}),0,0.62,1.51));
   g.add(rot(at(box(0.5,1.5,0.04,'#FFC46B',{w:0.015}),0.42,0.7,1.6),0,-0.6,0));
   for(const s of[-1,1])g.add(at(cyl(0.03,0.03,0.4,'#8B5E3C',4,{ol:false}),1.5*s,0.15,1.6));
   place(g,-9,-47,1.8,{k:'tent',n:'the tent',c:['orange'],s:'pointy',m:'canvas',v:'cosy for camping',u:'sleep under the stars in',e:'⛺🌙🔦',
     r:['I’m a house you can fold up and carry in a bag.','I go up with poles and pegs and come down in the morning.']},{exact:true,ry:0.3});}
  {const g=G_(scl(at(cap(0.32,1.1,'#4D96FF',{w:0.02}),0,0.2,0),1,0.45,1),at(scl(sph(0.26,'#2E5AAC',8,6,{ol:false}),1,0.5,1),0,0.26,-0.6));g.children[0].rotation.x=Math.PI/2;
   place(g,-6.2,-48.6,0.8,{k:'sleeping bag',n:'the sleeping bag',c:['blue'],s:'long and puffy',m:'fabric',v:'snug as a bug',u:'zip yourself into',e:'💤🛌🏕️',
     r:['Zip me up and I’ll keep you warm all night outdoors.']},{solid:false,ry:-0.4});}
  // campfire with flickering flames, log seats and a marshmallow on a stick
  {const g=new THREE.Group();for(let i=0;i<9;i++){const a=i/9*TAU;g.add(at(scl(sph(0.22,'#9A93AE',6,4,{w:0.02}),1,0.6,1),Math.cos(a)*0.75,0.08,Math.sin(a)*0.75));}
   for(let i=0;i<3;i++)g.add(rot(at(cyl(0.08,0.08,1,'#6B4226',6,{w:0.02}),0,0.15,0),Math.PI/2,i*1.05,0.25));
   const flames=[];[['#FF5D1A',0.32,0.9],['#FFB21A',0.22,0.7],['#FFF07A',0.12,0.45]].forEach(([c,r,h])=>{const f=cone(r,h,c,7,{ol:false,shadow:false});f.position.y=0.25+h/2;f.material=new THREE.MeshBasicMaterial({color:c});g.add(f);flames.push(f);});
   place(g,-2.5,-47.8,1,{k:'campfire',n:'the campfire',c:['orange','red'],s:'flickery',m:'fire',v:'warm and crackly',snd:'crackle-pop',u:'toast marshmallows over',e:'🔥🏕️🍡',
     r:['I crackle and dance, and I turn marshmallows golden.','Feed me sticks and I’ll keep you warm, but never touch me.'],mv:true},{exact:true});
   W.movers.push(t=>{flames.forEach((f,i)=>{const k=1+0.18*Math.sin(t*9+i*2)+0.1*Math.sin(t*14+i);f.scale.set(1/Math.sqrt(k),k,1/Math.sqrt(k));f.rotation.y=t*(i%2?2:-1.5);});});
   for(const [dx,dz,ry] of[[-2.3,0.2,Math.PI/2],[2.3,-0.3,Math.PI/2],[0.2,2.3,0]]){const l=rot(at(cyl(0.28,0.3,1.8,'#8B5E3C',8),0,0.28,0),0,0,Math.PI/2);const s=grp(l);onGround(s,-2.5+dx,-47.8+dz);s.rotation.y=ry;F(s,{k:'log',n:'a log seat',c:['brown'],s:'round',m:'wood',p:false});circ(-2.5+dx,-47.8+dz,0.5);}
   const st=G_(rot(at(cyl(0.015,0.015,1.3,'#8B5E3C',4,{ol:false}),0,0.3,0),0,0,1.1),at(cyl(0.06,0.06,0.1,'#FFF3D6',8,{w:0.01}),-0.58,0.58,0));
   place(st,-0.9,-47.6,0.2,{k:'marshmallow',n:'the marshmallow on a stick',c:['white'],s:'tiny',m:'sugar',v:'slightly toasted',u:'toast over the fire',e:'🍡🔥😋',
     r:['I’m a squishy white sweet waiting on a stick for the fire.']},{solid:false,ry:0.3,y:0.1});}
  // a big oak with a rope swing
  {const t=leafyTree(9,-47.5,{s:1.45});
   const sw=new THREE.Group();sw.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new V3(-0.3,0,0),new V3(-0.3,-2.6,0),new V3(0.3,0,0),new V3(0.3,-2.6,0)]),new THREE.LineBasicMaterial({color:0x2B2040})));
   sw.add(at(box(0.8,0.08,0.32,'#C8935E',{w:0.02}),0,-2.65,0));
   sw.position.copy(worldAt(t,1.2,3.3,0.2));scene.add(sw);
   F(sw,{k:'rope swing',n:'the rope swing',c:['brown'],s:'dangly',m:'rope',v:'swinging in the breeze',snd:'creak',u:'swing out from the big tree on',e:'🌳🪢😄',
     r:['I’m a plank on two ropes hanging from a big branch.'],mv:true});
   W.movers.push(t=>{sw.rotation.x=Math.sin(t*1.4)*0.35;});}
  // a rabbit that hops about the grass
  {const r=new THREE.Group();r.add(scl(at(sph(0.26,'#F2F2EC',9,7),0,0.26,0),0.9,0.85,1.15));r.add(at(sph(0.17,'#F2F2EC',8,6),0,0.46,0.26));
   for(const s of[-1,1]){r.add(rot(at(cap(0.05,0.26,'#F2F2EC',{w:0.015}),0.07*s,0.72,0.2),-0.2,0,0.15*s));r.add(at(sph(0.03,'#1D1533',4,3,{ol:false,shadow:false}),0.08*s,0.5,0.4));}
   r.add(at(sph(0.09,'#FFFFFF',6,5,{w:0.01}),0,0.3,-0.32));r.add(at(sph(0.035,'#FF8FA8',4,3,{ol:false}),0,0.45,0.42));scene.add(r);
   F(r,{k:'rabbit',n:'the rabbit',c:['white'],s:'fluffy',m:'fur',v:'quick and twitchy',snd:'thump-thump',u:'feed a carrot to',e:'🐇🥕💨',
     r:['I have long ears, a fluffy tail, and I love carrots.'],mv:true});
   const pts=[[14,-45],[18,-47.5],[15,-50],[11.5,-44.5]];
   W.movers.push(t=>{const u=(t*0.35)%pts.length,i=Math.floor(u),f=u-i,a=pts[i],b=pts[(i+1)%pts.length];const hop=f%0.25/0.25;
     const x=lerp(a[0],b[0],f),z=lerp(a[1],b[1],f);r.position.set(x,landH(x,z)+Math.sin(hop*Math.PI)*0.35,z);r.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);});}
  // a bench looking out to sea, and a little flower meadow
  {const g=new THREE.Group();g.add(at(box(2,0.14,0.6,'#8B5E3C'),0,0.55,0));g.add(at(box(2,0.5,0.1,'#8B5E3C'),0,0.9,-0.28));
   for(const s of[-1,1])g.add(at(box(0.1,0.55,0.55,'#5B3A29',{w:0.02}),0.85*s,0.27,0));onGround(g,-16,-50.5);g.rotation.y=Math.PI+0.2;F(g,{k:'bench',n:'a bench',c:['brown'],s:'long',m:'wood',p:false});circ(-16,-50.5,1);}
  for(const [x,z] of[[-20,-45.5],[20.5,-45],[3.5,-52]])if(!blocked(x,z,1.2,true))leafyTree(x,z,{s:0.9});
}
