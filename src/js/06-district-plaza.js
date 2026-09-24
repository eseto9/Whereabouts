/* =========================================================
   Town Square
   ========================================================= */
function buildPlaza(){
  // radial cobble plaza
  const tex=canvasTex(512,512,(x,W,H)=>{
    x.fillStyle='#EBD7BD';x.fillRect(0,0,W,H);
    x.strokeStyle='#D2B998';x.lineWidth=3;
    for(let r=18;r<260;r+=22){x.beginPath();x.arc(256,256,r,0,TAU);x.stroke();
      const n=Math.floor(r/7);for(let i=0;i<n;i++){const a=i/n*TAU+(r%44?0.1:0);x.beginPath();x.moveTo(256+Math.cos(a)*r,256+Math.sin(a)*r);x.lineTo(256+Math.cos(a)*(r+22),256+Math.sin(a)*(r+22));x.stroke();}}
    x.fillStyle='#E07A5F';x.globalAlpha=0.25;x.beginPath();x.arc(256,256,60,0,TAU);x.fill();
  });
  const pl=new THREE.Mesh(new THREE.CircleGeometry(15,48),MT(tex));
  pl.rotation.x=-Math.PI/2; pl.position.y=0.34; pl.receiveShadow=true; scene.add(pl); W.pickables.push(pl);

  // fountain
  {const g=new THREE.Group();
   g.add(at(cyl(3.2,3.4,0.8,'#D9C7AE',20),0,0.4,0));
   g.add(at(mk(new THREE.CylinderGeometry(2.85,2.85,0.1,20),'#6FD6EA',{ol:false}),0,0.78,0));
   g.add(at(cyl(0.45,0.6,2,'#D9C7AE',10),0,1.6,0));
   g.add(at(cyl(1.3,0.5,0.5,'#E8D8C0',14),0,2.7,0));
   g.add(at(mk(new THREE.CylinderGeometry(1.15,1.15,0.08,14),'#6FD6EA',{ol:false}),0,2.92,0));
   const spout=at(cone(0.35,0.9,'#BFF3FF',8,{w:0.03}),0,3.4,0); g.add(spout);
   const drops=[];for(let i=0;i<8;i++){const d=sph(0.1,'#BFF3FF',6,5,{ol:false,shadow:false});g.add(d);drops.push(d);}
   onGround(g,0,0,0.04);
   F(g,{k:'fountain',n:'the fountain',c:['blue','cream'],s:'round',m:'stone',v:'extremely relaxed',snd:'splish-splash',u:'toss a coin into',e:'💧🪙✨',r:'I spit water all day and nobody tells me off.'});
   circ(0,0,3.4);
   W.movers.push(t=>{spout.scale.y=1+0.12*Math.sin(t*6);drops.forEach((d,i)=>{const f=((t*0.7+i/8)%1);const a=i/8*TAU;d.position.set(Math.cos(a)*(0.5+f*1.6),3.6+f*1.2-f*f*3.2,Math.sin(a)*(0.5+f*1.6));});});}

  // clock tower with real-time hands
  {const g=new THREE.Group();
   g.add(at(box(3,9,3,'#F4E4C1'),0,4.5,0));
   g.add(at(box(3.4,0.6,3.4,'#D9534F'),0,9.2,0));
   g.add(at(box(3.2,2.4,3.2,'#F4E4C1'),0,10.7,0));
   g.add(rot(at(cone(2.6,3.4,'#D9534F',4),0,13.6,0),0,Math.PI/4,0));
   g.add(at(sph(0.25,'#FFD23F',8,6),0,15.5,0));
   g.add(at(box(1.2,1.8,0.2,'#8A5A44',{w:0.03}),0,0.9,1.55));
   const face=canvasTex(256,256,(x)=>{x.fillStyle='#FFFDF3';x.beginPath();x.arc(128,128,120,0,TAU);x.fill();x.lineWidth=10;x.strokeStyle='#2B2040';x.stroke();
     x.fillStyle='#2B2040';for(let i=0;i<12;i++){const a=i/12*TAU;x.beginPath();x.arc(128+Math.cos(a)*95,128+Math.sin(a)*95,i%3?5:10,0,TAU);x.fill();}});
   const hands=[];
   for(const [px,pz,ry] of [[0,1.62,0],[1.62,0,Math.PI/2]]){
     const fg=new THREE.Group(); fg.position.set(px,10.7,pz); fg.rotation.y=ry;
     const fm=new THREE.Mesh(new THREE.CircleGeometry(1.25,32),MT(face)); fm.position.z=0.01; fg.add(fm);
     const hh=new THREE.Group(), mh=new THREE.Group();
     hh.add(at(box(0.14,0.65,0.05,'#2B2040',{ol:false}),0,0.3,0)); mh.add(at(box(0.1,0.95,0.05,'#2B2040',{ol:false}),0,0.45,0));
     hh.position.z=0.06; mh.position.z=0.09; fg.add(hh,mh); g.add(fg); hands.push([hh,mh]);
   }
   onGround(g,-8,-9);
   F(g,{k:'clock tower',n:'the clock tower',c:['cream','red'],s:'tall and skinny',m:'brick',v:'always in a hurry',snd:'tick-tock',u:'check the time on',e:'⏰🙌🏰',r:'I have a face and two hands, but I can never wave hello.'});
   rect(-8,-9,3.3,3.3);
   W.movers.push(()=>{const d=new Date();const m=d.getMinutes()+d.getSeconds()/60,h=(d.getHours()%12)+m/60;
     for(const [hh,mh] of hands){hh.rotation.z=-h/12*TAU;mh.rotation.z=-m/60*TAU;}});}

  // café
  {const g=new THREE.Group();
   g.add(at(box(7,3.8,5,'#9FE3C9'),0,1.9,0));
   g.add(at(box(7.4,0.4,5.4,'#FFFFFF'),0,3.95,0));
   g.add(at(box(1.2,2,0.2,'#8A5A44',{w:0.03}),-1.8,1,2.55));
   g.add(at(box(2.4,1.3,0.15,'#BFE9FF',{w:0.03}),1.4,1.7,2.55));
   const aw=mk(new THREE.BoxGeometry(7.2,0.15,1.8),0,{mat:MT(stripeTex('#FF6F8E','#FFFFFF',10))}); aw.position.set(0,2.9,3.3); aw.rotation.x=0.3; g.add(aw);
   const s=signBox('Brew Ha Ha',4.6,0.9,'#2B2040','#FFD23F'); s.position.set(0,3.35,2.6); g.add(s);
   g.add(at(cyl(0.3,0.3,0.4,'#FFFFFF',10),2.8,4.4,1.2)); g.add(at(cyl(0.34,0.34,0.08,'#8A5A44',10),2.8,4.64,1.2));
   onGround(g,10,-11);
   F(g,{k:'cafe',n:'the Brew Ha Ha café',c:['mint','pink'],s:'boxy',m:'wood',v:'wide awake',snd:'hiss-gurgle',u:'grab a latte at',e:'☕😆🏠'});
   rect(10,-11,7.2,5.2);
  }
  // café tables with umbrellas
  const umbs=[['red','#FF5D73'],['yellow','#FFD23F'],['blue','#4D96FF']];
  [[5.6,-6.2],[10,-5.4],[14.2,-6.4]].forEach(([x,z],i)=>{
    const t=new THREE.Group();
    t.add(at(cyl(0.08,0.12,0.9,'#5B4B7A',6),0,0.45,0)); t.add(at(cyl(0.7,0.7,0.08,'#FFFFFF',14),0,0.92,0));
    onGround(t,x,z); F(t,{k:'table',n:'a café table',c:['white'],s:'round',m:'metal',p:false});
    for(const s of[-1,1]){const ch=new THREE.Group();ch.add(at(box(0.5,0.08,0.5,'#5B4B7A',{w:0.03}),0,0.5,0));ch.add(at(box(0.5,0.6,0.08,'#5B4B7A',{w:0.03}),0,0.8,-0.22*s));
      onGround(ch,x+s*1.05,z);ch.rotation.y=s*Math.PI/2;F(ch,{k:'chair',n:'a café chair',c:['purple'],s:'boxy',m:'metal',p:false});}
    const [cn,cc]=umbs[i]; const u=new THREE.Group();
    u.add(at(cyl(0.05,0.05,2.4,'#FFFFFF',6,{ol:false}),0,1.2,0)); u.add(at(cone(1.5,0.8,cc,8),0,2.5,0));
    onGround(u,x,z); F(u,{k:'umbrella',n:`the ${cn} café umbrella`,c:[cn],s:'pointy',m:'fabric',v:'throwing shade',u:'hide from the sun under',e:'☀️🙅‍♀️'});
    circ(x,z,0.8);
  });

  // statue of a heroic Wanderbean
  {const g=new THREE.Group(); const br='#C28F52';
   g.add(at(box(2,1.4,2,'#D9C7AE'),0,0.7,0));
   g.add(at(cap(0.5,0.6,br),0,2.2,0));
   const arm=rot(at(cap(0.12,0.5,br),0.55,2.8,0),0,0,-2.5); g.add(arm);
   g.add(at(cap(0.12,0.3,br),-0.55,1.95,0));
   g.add(at(sph(0.12,br,6,5),0.95,3.25,0));
   const pl=signBox('Our Founder',1.5,0.35,'#C28F52','#2B2040'); pl.position.set(0,0.8,1.03); g.add(pl);
   onGround(g,-9,8); g.rotation.y=0.5;
   F(g,{k:'statue',n:'the Wanderbean statue',c:['bronze','gold'],s:'tall',m:'bronze',v:'very proud of itself',u:'strike a pose next to',e:'🗿💪🏆',r:"I've held the same pose for a hundred years and never once got tired."});
   circ(-9,8,1.5);}

  // balloon seller + runaway balloon
  {const v=npc('#FF9F1C','#2B2040'); onGround(v,8,8); v.rotation.y=-2.3;
   const bunch=new THREE.Group(); const bc=['#FF5D73','#4D96FF','#FFD23F','#3DDC97','#9B5DE5'];
   bc.forEach((c,i)=>{const a=i/5*TAU;const b=scl(sph(0.32,c,10,8,{w:0.03}),1,1.2,1);b.position.set(Math.cos(a)*0.45,3.3+Math.sin(i*2)*0.3,Math.sin(a)*0.45);bunch.add(b);});
   bunch.position.set(0.45,0,0); v.add(bunch);
   const strings=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new V3(0.45,1.2,0),new V3(0.45,3,0)]),new THREE.LineBasicMaterial({color:0x2B2040}));
   v.add(strings);
   F(v,{k:'balloon seller',n:'the balloon seller',c:['orange'],s:'tall',m:'cotton',v:'endlessly cheerful',snd:'pop',u:'buy a balloon from',e:'🎈💵😊'});
   circ(8,8,0.8);
   W.movers.push(t=>{bunch.position.y=Math.sin(t*1.3)*0.08;bunch.rotation.y=Math.sin(t*0.5)*0.3;v.userData.arms[1].rotation.z=2.4+Math.sin(t*2)*0.1;});
   const rb=new THREE.Group(); rb.add(scl(sph(0.34,'#FF5D73',10,8,{w:0.03}),1,1.2,1));
   rb.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new V3(0,-0.4,0),new V3(0,-1.6,0)]),new THREE.LineBasicMaterial({color:0x2B2040})));
   scene.add(rb);
   F(rb,{k:'balloon',n:'the runaway balloon',c:['red'],s:'round',m:'rubber',v:'desperate to escape',e:'🎈🏃‍♂️☁️',r:"I slipped out of someone's hand and I'm never coming back.",mv:true});
   W.movers.push(t=>{const f=(t%45)/45;rb.position.set(8.4+Math.sin(t*0.8)*1.5*f+f*6,landH(8,8)+3.4+f*55,8+Math.cos(t*0.6)*f*4);});}

  // juggler
  {const j=npc('#9B5DE5','#FFD23F'); onGround(j,-3,10.5); j.rotation.y=Math.PI;
   const balls=['#FF5D73','#3DDC97','#4D96FF'].map(c=>{const b=sph(0.14,c,8,6,{w:0.03});j.add(b);return b;});
   F(j,{k:'juggler',n:'the juggler',c:['purple','yellow'],s:'tall',m:'cotton',v:'showing off a little',snd:'whoosh',u:'toss a coin to',e:'🤹🎪🔴'});
   circ(-3,10.5,0.6);
   W.movers.push(t=>{balls.forEach((b,i)=>{const f=((t*1.1+i/3)%1);b.position.set(lerp(-0.45,0.45,f<0.5?f*2:2-f*2),1.6+Math.sin(f*Math.PI)*1.3,0.35);});
     j.userData.arms[0].rotation.x=-1.2+Math.sin(t*7)*0.3;j.userData.arms[1].rotation.x=-1.2-Math.sin(t*7)*0.3;});}

  // mailbox
  {const g=new THREE.Group();
   g.add(at(box(0.18,1,0.18,'#2B2040'),0,0.5,0));
   g.add(at(box(0.7,0.7,1,'#4D96FF'),0,1.25,0));
   g.add(rot(at(cyl(0.35,0.35,1,'#4D96FF',12),0,1.6,0),Math.PI/2,0,0));
   g.add(at(box(0.08,0.4,0.08,'#FF5D73',{w:0.02}),0.4,1.75,0.2));
   onGround(g,12.5,4.5);
   F(g,{k:'mailbox',n:'the blue mailbox',c:['blue'],s:'boxy',m:'metal',v:'full of secrets',u:'drop a letter into',e:'✉️🤫📦',r:"I'm stuffed full of other people's words."});
   circ(12.5,4.5,0.6);}
  // newsstand
  {const g=new THREE.Group();
   g.add(at(box(2.2,2.2,1.6,'#3DDC97'),0,1.1,0));
   g.add(at(box(2.6,0.2,2,'#2B2040'),0,2.3,0));
   const s=signBox('NEWS',1.6,0.5,'#FFFFFF','#FF5D73'); s.position.set(0,2.7,0.3); g.add(s);
   for(let i=0;i<4;i++) g.add(at(box(0.45,0.6,0.05,['#FFFFFF','#FFE8A3','#DDE8FF','#FFD6E0'][i],{w:0.02}),-0.75+i*0.5,1.3,0.83));
   onGround(g,-12,1.5); g.rotation.y=Math.PI/2;
   F(g,{k:'newsstand',n:'the newsstand',c:['green'],s:'boxy',m:'wood',v:'extremely nosy',snd:'extra, extra',u:'catch up on gossip at',e:'📰👀🗞️'});
   rect(-12,1.5,1.8,2.4);}
  // bin
  {const g=new THREE.Group(); g.add(at(cyl(0.4,0.34,1,'#2E9E5B',10),0,0.5,0)); g.add(at(cyl(0.45,0.45,0.1,'#2B2040',10),0,1.05,0));
   g.add(rot(at(mk(new THREE.TorusGeometry(0.12,0.05,5,8,Math.PI),'#FFD23F'),0.1,1.15,0),0,0,0.5));
   onGround(g,-11,-4.5);
   F(g,{k:'bin',n:'the green bin',c:['green'],s:'round',m:'metal',v:'a little grumpy',u:'toss your wrapper into',e:'🗑️🍌😤',r:'People only visit me to give me their garbage.'});
   circ(-11,-4.5,0.5);}
  // hopscotch
  {const t=canvasTex(128,512,(x,W,H)=>{x.clearRect(0,0,W,H);x.strokeStyle='#FFFFFF';x.lineWidth=7;x.fillStyle='#FFFFFF';x.font='40px "Lilita One", sans-serif';x.textAlign='center';x.textBaseline='middle';
     const cells=[[1],[2],[3,4],[5],[6,7],[8]];let y=H-10;cells.forEach(r=>{const h=75;r.forEach((n,i)=>{const w=r.length===1?80:60;const X=r.length===1?W/2-40:(i?W/2:W/2-60);x.strokeRect(X,y-h,w,h);x.fillText(n,X+w/2,y-h/2);});y-=h;});});
   const m=new THREE.Mesh(new THREE.PlaneGeometry(1.6,6.2),new THREE.MeshToonMaterial({map:t,transparent:true,gradientMap:gradTex,depthWrite:false}));
   m.rotation.x=-Math.PI/2; m.rotation.z=0.4; m.position.set(4,0.36,11); scene.add(m);
   F(m,{k:'hopscotch',n:'the hopscotch grid',c:['white'],s:'flat',m:'chalk',v:'ready to play',u:'hop along',e:'1️⃣2️⃣🦘'});}
  // sunflower
  {const g=new THREE.Group();
   g.add(at(cyl(0.07,0.1,2.6,'#3E9E4A',6),0,1.3,0));
   g.add(rot(at(cyl(0.6,0.6,0.12,'#FFD23F',14),0,2.7,0.1),1.2,0,0));
   g.add(rot(at(cyl(0.3,0.3,0.16,'#7A4A22',10),0,2.72,0.16),1.2,0,0));
   g.add(rot(at(scl(sph(0.3,'#4CB85A',6,4),1,0.2,0.6),0.3,1.4,0),0,0,0.5));
   onGround(g,15,-7.5);
   F(g,{k:'sunflower',n:'the giant sunflower',c:['yellow','green'],s:'tall and skinny',m:'petals',v:'sunny about everything',u:'take a selfie with',e:'🌞🌼📏'});}
  // fire hydrant
  {const g=new THREE.Group(); g.add(at(cyl(0.25,0.3,0.8,'#FF3B3B',10),0,0.4,0)); g.add(at(sph(0.26,'#FF3B3B',10,6),0,0.82,0));
   for(const s of[-1,1]) g.add(rot(at(cyl(0.09,0.09,0.25,'#FF3B3B',8),0.28*s,0.55,0),0,0,Math.PI/2));
   onGround(g,15.5,5.2);
   F(g,{k:'hydrant',n:'the fire hydrant',c:['red'],s:'short and stubby',m:'metal',v:'always on standby',snd:'fwoosh',u:'hook a hose up to',e:'🚒💦🧯'}); circ(15.5,5.2,0.4);}
  // red bench (unique) and regular benches
  const bench=(x,z,ry,col,uniq)=>{const g=new THREE.Group();
    g.add(at(box(2.2,0.14,0.6,col),0,0.55,0)); g.add(at(box(2.2,0.5,0.1,col),0,0.9,-0.28));
    for(const s of[-1,1]) g.add(at(box(0.1,0.55,0.55,'#2B2040',{w:0.02}),0.95*s,0.27,0));
    onGround(g,x,z); g.rotation.y=ry;
    F(g,uniq?{k:'bench',n:'the red bench',c:['red'],s:'long',m:'wood',v:'patient',u:'sit and people-watch on',e:'🪑👀⏳'}:{k:'bench',n:'a bench',c:['green'],s:'long',m:'wood',p:false});
    circ(x,z,1.1);};
  bench(0,-12.6,0,'#FF5D73',true);
  bench(-12.4,-8,Math.PI/2.4,'#4CB85A'); bench(12.6,9.5,-2.2,'#4CB85A'); bench(-6,13,Math.PI,'#4CB85A');
  // lamp posts
  for(let i=0;i<10;i++){const a=i/10*TAU+0.2;const x=Math.cos(a)*14.2,z=Math.sin(a)*14.2;
    if(Math.hypot(x-12.5,z-4.5)<2||Math.hypot(x+12,z-1.5)<2.5||Math.hypot(x-15.5,z-5.2)<2)continue;
    const g=new THREE.Group(); g.add(at(cyl(0.08,0.12,3.4,'#2B2040',6),0,1.7,0)); g.add(at(sph(0.28,'#FFF2B3',8,6),0,3.55,0));
    g.add(at(cone(0.35,0.3,'#2B2040',6,{w:0.02}),0,3.9,0)); onGround(g,x,z);
    F(g,{k:'lamp',n:'a lamp post',c:['black'],s:'tall and skinny',m:'iron',p:false}); circ(x,z,0.25);}
  // pigeons (one wears a tiny hat)
  const spots=[[3,5],[4.2,4],[-2.5,5.5],[-3.6,4.4],[1.5,6.5],[5.5,-3.8],[-4.6,-4.2]];
  spots.forEach(([x,z],i)=>{
    const p=pigeonMesh(); const home=[x,z];
    if(i===2){p.add(at(cyl(0.08,0.1,0.14,'#2B2040',8,{w:0.02}),0,0.62,0.18));p.add(at(cyl(0.16,0.16,0.02,'#2B2040',8,{ol:false}),0,0.55,0.18));}
    onGround(p,x,z); p.rotation.y=srand()*TAU;
    F(p,i===2?{k:'pigeon',n:'the pigeon in a tiny hat',c:['grey','purple'],s:'round',m:'feathers',v:'deeply suspicious',snd:'coo-coo',e:'🐦🎩🕵️',r:'I wear a tiny hat and I will absolutely steal your sandwich.',mv:true}
                   :{k:'pigeon',n:'a pigeon',c:['grey'],s:'round',m:'feathers',p:false});
    const st={fly:0,ph:srand()*10};
    W.movers.push((t,dt)=>{
      const near=W.nearBeans?W.nearBeans(p.position.x,p.position.z,3.2):false;
      if(near&&st.fly<=0) st.fly=4;
      const gy=landH(home[0],home[1]);
      if(st.fly>0){st.fly-=dt;const f=Math.sin(Math.min(1,(4-st.fly)/4)*Math.PI);p.position.y=gy+f*6;p.position.x=home[0]+Math.sin(t*2+st.ph)*f*2;p.rotation.z=Math.sin(t*20)*0.2;}
      else{p.position.set(home[0]+Math.sin(t*0.3+st.ph)*0.6,gy,home[1]+Math.cos(t*0.25+st.ph)*0.6);p.rotation.z=0;p.rotation.x=Math.max(0,Math.sin(t*3+st.ph))*0.5;}
    });
  });
  // paper airplane looping over the square
  {const g=new THREE.Group();
   const shp=new THREE.Shape();shp.moveTo(0,0.5);shp.lineTo(0.35,-0.3);shp.lineTo(0,-0.15);shp.lineTo(-0.35,-0.3);shp.lineTo(0,0.5);
   const pm=mk(new THREE.ShapeGeometry(shp),'#FFFFFF',{mat:new THREE.MeshToonMaterial({color:'#FFFFFF',side:THREE.DoubleSide,gradientMap:gradTex}),w:0.03});
   pm.rotation.x=-Math.PI/2; g.add(pm); scene.add(g);
   F(g,{k:'paper airplane',n:'the paper airplane',c:['white'],s:'pointy',m:'paper',v:'carefree',snd:'fwip',e:'📄✈️🌀',r:'Somebody folded me out of homework and let me go.',mv:true});
   const prev=new V3();
   W.movers.push(t=>{const a=t*0.35;prev.copy(g.position);g.position.set(Math.sin(a)*9,6.5+Math.sin(a*2)*1.4,Math.sin(a)*Math.cos(a)*9);
     const dx=g.position.x-prev.x,dz=g.position.z-prev.z;if(Math.abs(dx)+Math.abs(dz)>1e-5)g.rotation.y=Math.atan2(dx,dz)+Math.PI;g.rotation.z=Math.sin(a*2)*0.5;});}
}

