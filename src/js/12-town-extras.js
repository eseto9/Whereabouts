/* =========================================================
   More to find around the rest of town: big landmarks for
   Easy, and lots of small things tucked away for Hard
   ========================================================= */
// a spot on the beach: angle around the island, distance in from the shoreline
const beach=(a,inset)=>{const r=shoreR(a)-inset;return [Math.cos(a)*r,Math.sin(a)*r];};
const flat=(w,d,col,o)=>{const m=mk(new THREE.BoxGeometry(w,0.03,d),col,Object.assign({ol:false,shadow:false},o||{}));m.position.y=0.02;return m;};

function buildExtras(){
  /* ---------- Town Square ---------- */
  {const b=npc('#FF5D73','#2B2040');const gt=new THREE.Group();gt.add(scl(at(sph(0.3,'#C8793C',10,8,{w:0.02}),0,0,0),1,1.2,0.35));gt.add(at(box(0.08,0.8,0.05,'#5B3A29',{w:0.015}),0,0.6,0));
   gt.position.set(0.1,1.05,0.4);gt.rotation.z=-0.9;b.add(gt);b.userData.arms[1].rotation.set(-1,0,0.6);
   place(b,-6,-10.5,0.6,{k:'busker',n:'the busker',c:['red'],s:'tall',m:'cotton',v:'strumming for coins',snd:'strum-strum',u:'drop a coin for',e:'🎸🎶🪙',r:['I play songs on the street for your spare change.']},{ry:0.4});
   const bp=b.position.clone();
   const case_=G_(at(box(0.9,0.1,0.4,'#2B2040',{w:0.015}),0,0.05,0),at(box(0.8,0.02,0.32,'#9B2335',{ol:false}),0,0.1,0));for(let i=0;i<4;i++)case_.add(at(cyl(0.04,0.04,0.01,'#FFD23F',8,{ol:false}),-0.2+i*0.13,0.12,(i%2)*0.08));
   place(case_,bp.x+0.9,bp.z+0.6,0.4,{k:'guitar case',n:'the guitar case',c:['black','red'],s:'flat',m:'leather',v:'hoping for tips',snd:'clink',u:'toss your coins into',e:'🎸💰🙏',r:['I lie open on the ground, collecting coins for music.']},{solid:false});}
  {const g=G_(rot(at(box(0.16,0.04,0.22,'#FF9F1C',{w:0.01}),0,0,0),0,0.4,0),rot(at(box(0.06,0.04,0.12,'#FF9F1C',{ol:false}),0.06,0,0.14),0,0.2,0));
   g.position.set(0.6,landH(0,-12.6)+0.63,-12.55);scene.add(g);
   F(g,{k:'glove',n:'the lost glove',c:['orange'],s:'hand-shaped',m:'wool',v:'missing its twin',u:'keep one hand warm',e:'🧤😢🔍',r:['I’m missing my other half, and I’m lying on a bench.']});}
  {const g=G_(at(box(0.8,0.05,0.22,'#4D96FF'),0,0.12,0));for(const x of[-0.28,0.28])for(const z of[-0.08,0.08])g.add(rot(at(cyl(0.04,0.04,0.04,'#FFD23F',8,{ol:false}),x,0.05,z),Math.PI/2,0,0));
   place(g,6,9.5,0.4,{k:'skateboard',n:'the skateboard',c:['blue','yellow'],s:'long and flat',m:'wood',v:'ready to roll',snd:'clack',u:'kickflip on',e:'🛹🤙💨',r:['I’m a plank with four little wheels, and I love a good ramp.']},{solid:false,ry:0.8});}
  {const t=canvasTex(128,128,(x)=>{x.clearRect(0,0,128,128);x.strokeStyle='#FFD23F';x.lineWidth=8;x.beginPath();x.arc(64,64,24,0,TAU);x.stroke();for(let i=0;i<8;i++){const a=i/8*TAU;x.beginPath();x.moveTo(64+Math.cos(a)*34,64+Math.sin(a)*34);x.lineTo(64+Math.cos(a)*52,64+Math.sin(a)*52);x.stroke();}});
   const m=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.8),new THREE.MeshToonMaterial({map:t,transparent:true,gradientMap:gradTex,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(-5,0.37,-6.5);scene.add(m);
   F(m,{k:'chalk drawing',n:'the chalk sun',c:['yellow'],s:'flat',m:'chalk',v:'bright and hopeful',u:'draw next to',e:'☀️🖍️🙂',r:['Somebody drew me on the ground, and the next rain will wash me away.']});}
  {const g=G_(at(cyl(0.07,0.05,0.18,'#FFFFFF',8,{w:0.01}),0,0.09,0),at(cyl(0.075,0.075,0.03,'#8A5A44',8,{ol:false}),0,0.19,0));g.position.set(10.2,landH(10,-5.4)+0.97,-5.3);scene.add(g);
   F(g,{k:'cup',n:'the paper cup',c:['white'],s:'small',m:'paper',v:'half-finished',u:'drink coffee from',e:'☕🥤😴',r:['Someone left me on a café table with the last sip still inside.']});}
  {const g=new THREE.Group();for(const s of[-1,1])g.add(at(scl(sph(0.07,'#1D1533',8,6,{w:0.01}),1,0.8,0.3),0.08*s,0,0));g.add(at(box(0.05,0.015,0.015,'#FFD23F',{ol:false}),0,0.02,0));
   g.position.set(14.1,landH(14.2,-6.4)+1.0,-6.3);scene.add(g);
   F(g,{k:'sunglasses',n:'the sunglasses',c:['black','gold'],s:'small',m:'plastic',v:'effortlessly cool',u:'shade your eyes with',e:'🕶️☀️😎',r:['Put me on your nose and the sun gets dimmer.']});}
  {const g=G_(at(cone(0.12,0.3,'#E8B26A',8,{w:0.015}),0,0.12,0),at(sph(0.13,'#FFB3D1',8,6,{w:0.015}),0.12,0.03,0));g.children[0].rotation.z=Math.PI/2;g.children[0].position.set(0,0.1,0);
   place(g,-2,7.5,0.2,{k:'ice cream',n:'the dropped ice cream',c:['pink','tan'],s:'pointy',m:'dessert',v:'tragically melting',snd:'splat',u:'cry over',e:'🍦😭☀️',r:['Somebody dropped me, and now I’m melting into a sad pink puddle.']},{solid:false});}
  {const g=G_(at(cone(0.28,0.8,'#FF7A1A',10,{w:0.02}),0,0.45,0),at(box(0.6,0.06,0.6,'#FF7A1A',{w:0.015}),0,0.03,0),at(cyl(0.19,0.21,0.1,'#FFFFFF',10,{ol:false}),0,0.45,0));
   place(g,11,2.8,0.35,{k:'traffic cone',n:'the traffic cone',c:['orange','white'],s:'pointy',m:'plastic',v:'bossy',u:'block off a hole with',e:'🚧🔶⚠️',r:['I wear a party hat all day, but I’m only here to say “keep away”.']});}
  {const g=new THREE.Group();for(const s of[-1,1])g.add(at(box(0.1,2.4,0.1,'#2B2040'),1.2*s,1.2,0));g.add(at(box(2.6,0.12,1.2,'#4D96FF'),0,2.45,-0.2));
   g.add(at(box(2.4,1.3,0.06,'#BFE9FF',{w:0.02}),0,1.4,-0.7));g.add(at(box(2,0.12,0.4,'#8A5A44',{w:0.02}),0,0.5,-0.4));
   const s=signBox('BUS',0.8,0.5,'#FFD23F','#2B2040');s.position.set(1.2,2.9,0);g.add(s);
   place(g,-15,7.5,1.3,{k:'bus stop',n:'the bus stop',c:['blue','yellow'],s:'boxy',m:'metal',v:'patiently waiting',u:'wait for a ride at',e:'🚏⏳🚌',r:['People sit under my roof waiting for a big vehicle that’s always late.']},{ry:Math.PI/2});}
  {const g=G_(at(box(1,2.4,1,'#E8323F'),0,1.2,0),at(box(1.1,0.2,1.1,'#B3122E'),0,2.5,0),at(box(0.8,1.6,0.06,'#BFE9FF',{w:0.02}),0,1.3,0.52));
   const s=signBox('PHONE',0.8,0.2,'#FFFFFF','#E8323F');s.position.set(0,2.2,0.53);g.add(s);
   place(g,15.5,9.5,0.8,{k:'phone booth',n:'the phone booth',c:['red'],s:'tall and boxy',m:'metal',v:'nostalgic',snd:'ring-ring',u:'make a call from',e:'☎️🟥📞',r:['Before everyone had a phone in their pocket, they came inside me to call home.']},{ry:-2});}
  {const g=G_(at(cyl(0.07,0.09,8,'#E8E8F0',6),0,4,0),at(sph(0.14,'#FFD23F',6,5),0,8.1,0));
   const fl=mk(new THREE.PlaneGeometry(1.6,1,6,1),null,{mat:new THREE.MeshToonMaterial({map:stripeTex('#4D96FF','#FFFFFF',6),side:THREE.DoubleSide,gradientMap:gradTex}),ol:false});fl.position.set(0.85,7.4,0);g.add(fl);
   place(g,-14.5,-6,0.4,{k:'flagpole',n:'the flagpole',c:['white','blue'],s:'tall and skinny',m:'metal',v:'flapping proudly',snd:'flap-flap',u:'raise a flag on',e:'🏳️🌬️📏',r:['I’m the tallest stick in the square, with a flag that dances in the wind.'],mv:false});
   W.movers.push(t=>{const p=fl.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,Math.sin(t*4+x*3)*0.15*(x+0.8));}p.needsUpdate=true;});}
  {const g=new THREE.Group();g.add(at(box(1.8,1,0.9,'#FFFFFF'),0,0.8,0));for(const s of[-1,1])g.add(rot(at(cyl(0.25,0.25,0.1,'#2B2040',10),0.6*s,0.25,0.5),Math.PI/2,0,0));
   g.add(at(cyl(0.04,0.04,1.4,'#FFFFFF',5,{ol:false}),0,1.9,0));const u=mk(new THREE.ConeGeometry(1.1,0.5,10),0,{mat:MT(stripeTex('#E8323F','#FFD23F',10))});u.position.y=2.7;g.add(u);
   g.add(rot(at(cap(0.08,0.4,'#C8793C',{w:0.015}),0,1.4,0.48),0,0,Math.PI/2));
   place(g,7,14,1.2,{k:'hot dog stand',n:'the hot dog stand',c:['red','yellow'],s:'boxy',m:'metal',v:'sizzling',snd:'sizzle',u:'grab a snack at',e:'🌭🔥🌂',r:['I sell sausages tucked into long buns, with mustard on top.']});}

  /* ---------- Market Street ---------- */
  {const g=G_(at(box(1.1,2,0.8,'#4D96FF'),0,1,0),at(box(0.8,1.2,0.05,'#BFE9FF',{w:0.02}),-0.1,1.2,0.42));for(let i=0;i<6;i++)g.add(at(box(0.12,0.2,0.05,['#FF5D73','#FFD23F','#3DDC97'][i%3],{ol:false}),-0.35+(i%3)*0.25,1.5-Math.floor(i/3)*0.4,0.44));
   g.add(at(box(0.2,0.3,0.05,'#2B2040',{ol:false}),0.38,1.3,0.42));
   place(g,24,-7.5,0.7,{k:'vending machine',n:'the vending machine',c:['blue'],s:'tall and boxy',m:'metal',v:'always open',snd:'clunk',u:'buy a cold drink from',e:'🥤🪙🤖',r:['Put a coin in me, press a button, and a cold drink drops out.']});}
  {const g=new THREE.Group();for(const s of[-1,1]){g.add(rot(at(mk(new THREE.TorusGeometry(0.4,0.05,6,14),'#2B2040',{w:0.015}),0.7*s,0.45,0),0,Math.PI/2,0));}
   g.add(rot(at(cyl(0.04,0.04,1.3,'#3DDC97',5,{w:0.015}),0,0.75,0),0,0,Math.PI/2.2));g.add(at(box(0.4,0.3,0.35,'#B08968',{w:0.015}),0.85,1.05,0));g.add(at(box(0.3,0.06,0.15,'#2B2040',{ol:false}),-0.5,1.05,0));
   place(g,29,7.8,0.8,{k:'bike',n:'the bike with a basket',c:['green','brown'],s:'wheely',m:'metal',v:'ready for a ride',snd:'ring-ring',u:'ride to the market on',e:'🚲🧺🥖',r:['I have two wheels, pedals, and a basket for your baguette.']},{ry:0.2});}
  {const g=new THREE.Group();g.add(at(box(0.9,0.55,0.55,'#C8D4E0',{w:0.015}),0,0.75,0));for(const x of[-0.35,0.35])for(const z of[-0.2,0.2])g.add(at(sph(0.06,'#2B2040',5,4,{ol:false}),x,0.08,z));
   for(const x of[-0.35,0.35])g.add(at(box(0.04,0.5,0.04,'#C8D4E0',{ol:false}),x,0.35,0));g.add(at(box(0.6,0.04,0.04,'#E8323F',{ol:false}),0,1.1,-0.35));
   place(g,25,6.5,0.6,{k:'trolley',n:'the shopping trolley',c:['silver','red'],s:'boxy',m:'metal',v:'a bit wobbly',snd:'rattle',u:'wheel your shopping in',e:'🛒🍎🥕',r:['I have four wobbly wheels and a basket you push around the shops.']},{solid:false,ry:0.6});}
  {const g=G_(at(box(0.08,1.2,0.5,'#8B5E3C',{ol:false}),0,0.6,-0.3),at(box(0.08,1.2,0.5,'#8B5E3C',{ol:false}),0,0.6,0.3));g.children[0].rotation.x=0.3;g.children[1].rotation.x=-0.3;
   const t=canvasTex(128,160,(x)=>{x.fillStyle='#2B2040';x.fillRect(0,0,128,160);x.fillStyle='#FFFFFF';x.font='22px "Lilita One",sans-serif';x.textAlign='center';['SPECIALS','Apples 2','Cheese 5','Fish 4'].forEach((s,i)=>x.fillText(s,64,34+i*34));});
   const b=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.9,0.7),[M('#8B5E3C'),MT(t),M('#8B5E3C'),M('#8B5E3C'),M('#8B5E3C'),M('#8B5E3C')]);b.position.set(0.05,0.8,0.28);b.rotation.x=-0.3;outline(b,0.02);g.add(b);
   place(g,30,-7,0.4,{k:'chalkboard',n:'the chalkboard sign',c:['black','white'],s:'flat',m:'chalk',v:'full of bargains',u:'read today’s prices on',e:'🪧💲✏️',r:['Shopkeepers write today’s prices on me in dusty white.']},{solid:false,ry:Math.PI});}
  {const g=new THREE.Group();g.add(at(cyl(0.3,0.25,0.1,'#C8D4E0',12,{w:0.015}),0,0.35,0));g.add(at(box(0.3,0.3,0.25,'#E8323F',{w:0.015}),0,0.15,0));g.add(at(cyl(0.1,0.1,0.02,'#FFFFFF',10,{ol:false}),0,0.2,0.13));
   g.position.set(39.9,landH(39,-4.8)+0.9,-4.4);scene.add(g);
   F(g,{k:'scale',n:'the weighing scale',c:['red','silver'],s:'round',m:'metal',v:'very precise',u:'weigh your fruit on',e:'⚖️🍎🔢',r:['Put your apples in my dish and I’ll tell you how heavy they are.']});}
  {const g=new THREE.Group();for(const s of[-1,1])g.add(at(cyl(0.06,0.06,4.4,'#E8E8F0',6),0,2.2,5.6*s));
   const n=12;for(let i=0;i<n;i++){const z=lerp(-5.5,5.5,(i+0.5)/n),y=4.2-Math.sin((i+0.5)/n*Math.PI)*0.7;const f=mk(new THREE.ConeGeometry(0.2,0.4,3),['#FF5D73','#FFD23F','#4D96FF','#3DDC97'][i%4],{ol:false,shadow:false});f.rotation.x=Math.PI;f.position.set(0,y-0.2,z);g.add(f);}
   g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({length:13},(_,i)=>new V3(0,4.2-Math.sin(i/12*Math.PI)*0.7,lerp(-5.6,5.6,i/12)))),new THREE.LineBasicMaterial({color:0x2B2040})));
   g.position.set(36.5,landH(36.5,0),0);scene.add(g);circ(36.5,5.6,0.3);circ(36.5,-5.6,0.3);
   F(g,{k:'bunting',n:'the bunting',c:['red','yellow','blue'],s:'zigzag',m:'fabric',v:'in a party mood',snd:'flutter',u:'decorate a street party with',e:'🎉🔺🎊',r:['We’re little triangle flags strung across the street for a party.']});}
  {const c=new THREE.Group();c.add(scl(at(sph(0.25,'#2B2040',8,6),0,0.12,0),1.3,0.6,0.9));c.add(at(sph(0.15,'#2B2040',6,5),0.3,0.16,0));
   for(const s of[-1,1])c.add(rot(at(cone(0.05,0.1,'#2B2040',3,{ol:false}),0.33,0.3,0.07*s),0,0,-0.2));c.add(rot(at(cyl(0.03,0.03,0.4,'#2B2040',4,{ol:false}),-0.35,0.1,0.1),0,0.5,Math.PI/2));
   c.position.set(34.3,landH(33,-11.5)+3.0,-8.6);c.rotation.y=0.3;scene.add(c);
   F(c,{k:'cat',n:'the shop cat',c:['black'],s:'curled up',m:'fur',v:'fast asleep',snd:'purr',u:'let snooze on the awning',e:'🐈‍⬛💤🥐',r:['I sleep on the bakery’s awning, warm from the ovens below.']});}

  /* ---------- The Harbor ---------- */
  {const g=new THREE.Group();g.add(at(box(0.9,0.5,0.6,'#8B5E3C',{w:0.015}),0,0.25,0));const net=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.9,8,1,false,0,Math.PI),new THREE.MeshToonMaterial({color:'#D9C7A0',wireframe:true}));
   net.rotation.z=Math.PI/2;net.position.y=0.5;g.add(net);
   place(g,2.5,44.5,0.5,{k:'lobster trap',n:'the lobster trap',c:['brown'],s:'boxy',m:'wood',v:'waiting patiently',u:'catch lobsters with',e:'🦞🪤🌊',r:['Lobsters crawl into me for a snack and can’t find the way out.']},{solid:false});}
  {const g=new THREE.Group();for(let i=0;i<3;i++)g.add(rot(at(mk(new THREE.TorusGeometry(0.3-i*0.08,0.05,5,14),'#D9C7A0',{w:0.01}),0,0.05+i*0.05,0),Math.PI/2,0,0));
   g.position.set(-0.8,0.56,58);scene.add(g);
   F(g,{k:'rope',n:'the coil of rope',c:['beige'],s:'curly',m:'rope',v:'all wound up',u:'tie a boat up with',e:'🪢⚓🌀',r:['Sailors wind me round and round so I don’t get tangled.']});}
  {const g=G_(at(cyl(0.02,0.03,2.2,'#5B3A29',5,{ol:false}),0,1.1,0),at(cyl(0.06,0.06,0.1,'#C8D4E0',8,{ol:false}),0.05,0.4,0));g.rotation.z=0.25;
   place(g,-9,46.5,0.2,{k:'fishing rod',n:'the fishing rod',c:['brown'],s:'long and bendy',m:'wood',v:'hopeful',snd:'whizz',u:'catch a fish with',e:'🎣🐟🧵',r:['I’m a long bendy stick with a line and a hook at the end.']},{solid:false});}
  {const [x,z]=beach(2.2,6.8);const g=G_(rot(at(cyl(0.07,0.09,0.3,'#7FD4A8',8,{w:0.015}),0,0.07,0),0,0,Math.PI/2.3),rot(at(cyl(0.03,0.03,0.1,'#8B5E3C',5,{ol:false}),0.2,0.12,0),0,0,Math.PI/2.3),at(box(0.12,0.02,0.05,'#FFF7E6',{ol:false}),0,0.08,0));
   place(g,x,z,0.2,{k:'bottle',n:'the message in a bottle',c:['green'],s:'long',m:'glass',v:'full of secrets',u:'read a note from far away',e:'🍾📜🌊',r:['The sea carried me here with a secret note curled up inside.']},{solid:false});}
  {const [x,z]=beach(2.28,7.4);const g=new THREE.Group();for(let i=0;i<5;i++){const a=i/5*TAU;const arm=rot(at(cone(0.08,0.3,'#FF8C5A',4,{ol:false}),Math.cos(a)*0.12,0.03,Math.sin(a)*0.12),Math.PI/2,0,0);arm.rotation.z=-a+Math.PI/2;arm.rotation.set(Math.PI/2,0,-a-Math.PI/2);g.add(arm);}
   g.add(at(cyl(0.08,0.08,0.05,'#FF8C5A',8,{ol:false}),0,0.03,0));
   place(g,x,z,0.2,{k:'starfish',n:'the starfish',c:['orange'],s:'star-shaped',m:'shell',v:'a bit of a star',u:'gently put back in the sea',e:'⭐🌊🖐️',r:['I’m a star that lives on the beach, not in the sky.']},{solid:false});}
  {const [x,z]=beach(1.8,7.2);const g=new THREE.Group();const sh=mk(new THREE.SphereGeometry(0.16,10,6,0,TAU,0,Math.PI/2),'#FFD6E0',{w:0.015});sh.scale.set(1,0.5,1.2);g.add(sh);
   for(let i=0;i<5;i++)g.add(rot(at(box(0.01,0.08,0.3,'#E8A9B8',{ol:false}),-0.1+i*0.05,0.03,0),0,(i-2)*0.2,0));
   place(g,x,z,0.2,{k:'seashell',n:'the seashell',c:['pink'],s:'fan-shaped',m:'shell',v:'full of ocean sounds',snd:'whoosh (hold me to your ear)',u:'listen to the sea in',e:'🐚👂🌊',r:['Hold me to your ear and you’ll hear the sea.']},{solid:false});}
  {const [x,z]=beach(1.72,8.5);const g=G_(at(box(0.8,0.4,0.5,'#8B5E3C'),0,0.12,0),at(box(0.82,0.1,0.52,'#FFD23F',{ol:false}),0,0.3,0));const lid=rot(at(box(0.8,0.1,0.5,'#8B5E3C'),0,0.45,-0.2),-0.8,0,0);g.add(lid);
   for(let i=0;i<5;i++)g.add(at(cyl(0.05,0.05,0.02,'#FFD23F',8,{ol:false}),-0.25+i*0.12,0.34,(i%2)*0.1));
   place(g,x,z,0.5,{k:'treasure chest',n:'the treasure chest',c:['brown','gold'],s:'boxy',m:'wood',v:'full of pirate loot',snd:'clink',u:'dig up gold from',e:'🏴‍☠️💰🗝️',r:['Pirates buried me in the sand, and I’m full of gold coins.']},{solid:false,y:-0.15});}
  {const [x,z]=beach(1.64,9.5);const g=new THREE.Group();const b=scl(sph(0.4,'#FF5D73',12,8),0.6,3,0.12);b.position.y=1.15;g.add(b);g.add(at(box(0.05,2.2,0.02,'#FFFFFF',{ol:false}),0,1.15,0.05));g.rotation.x=-0.2;
   place(g,x,z,0.5,{k:'surfboard',n:'the surfboard',c:['pink','white'],s:'long and flat',m:'fibreglass',v:'stoked',snd:'swoosh',u:'ride a wave on',e:'🏄🌊🤙',r:['I’m long and flat, and I ride the waves with you standing on top.']});}
  {const [x,z]=beach(1.52,11);const g=new THREE.Group();for(const [sx,sz] of[[-1,-1],[1,-1],[-1,1],[1,1]])g.add(rot(at(cyl(0.07,0.07,2.6,'#FFFFFF',5),sx*0.55,1.3,sz*0.55),sz*0.1,0,-sx*0.1));
   g.add(at(box(1.4,0.1,1.2,'#FFFFFF'),0,2.6,0));g.add(at(box(0.8,0.6,0.1,'#E8323F'),0,3,-0.5));g.add(at(cyl(0.05,0.05,1.4,'#FFFFFF',5,{ol:false}),0.5,3.3,0.4));
   const um=mk(new THREE.ConeGeometry(0.8,0.4,8),0,{mat:MT(stripeTex('#E8323F','#FFFFFF',8))});um.position.set(0.5,4,0.4);g.add(um);
   const lr=mk(new THREE.TorusGeometry(0.25,0.08,6,12),0,{mat:MT(stripeTex('#E8323F','#FFFFFF',6)),w:0.015});lr.position.set(0,1.6,0.6);g.add(lr);
   place(g,x,z,1.1,{k:'lifeguard tower',n:'the lifeguard tower',c:['white','red'],s:'tall',m:'wood',v:'on high alert',snd:'tweeet (whistle)',u:'watch the swimmers from',e:'🛟👀🏊',r:['I’m a tall chair on stilts, and someone watches over the swimmers from my seat.']},{ry:-1.4});}
  {const [x,z]=beach(1.42,12);const g=new THREE.Group();g.add(at(box(2.2,2.2,2,'#FFFFFF'),0,1.1,0));
   const w=mk(new THREE.BoxGeometry(2.22,2,2.02),0,{mat:MT(stripeTex('#4D96FF','#FFFFFF',6)),ol:false});w.position.y=1.1;g.add(w);
   const r=mk(prismGeo(2.5,1,2.3),'#E8323F');r.position.y=2.2;g.add(r);g.add(at(box(0.8,1.5,0.1,'#FFD23F',{w:0.02}),0,0.75,1.02));
   place(g,x,z,1.5,{k:'beach hut',n:'the beach hut',c:['blue','white'],s:'boxy',m:'wood',v:'on holiday',u:'change into your swimsuit in',e:'🏖️🛖👙',r:['I’m a tiny striped house on the sand where you change into your swimsuit.']},{ry:-1.4});}
  {const g=G_(at(cyl(0.05,0.05,3.2,'#E8E8F0',5),0,1.6,0));const sock=G_(at(cyl(0.22,0.12,0.9,'#FF7A1A',8,{w:0.015}),0,0,0),at(cyl(0.2,0.2,0.2,'#FFFFFF',8,{ol:false}),0,0.2,0));
   sock.rotation.z=Math.PI/2;sock.position.set(0.5,3.1,0);const pv=new THREE.Group();pv.add(sock);g.add(pv);g.position.set(5.6,0.56,72.6);scene.add(g);
   F(g,{k:'windsock',n:'the windsock',c:['orange','white'],s:'cone-shaped',m:'fabric',v:'swayed by every breeze',snd:'flap',u:'see which way the wind blows',e:'🌬️🧦🧭',r:['I’m a giant sock on a pole that shows which way the wind is blowing.']});
   W.movers.push(t=>{pv.rotation.y=Math.sin(t*0.4)*0.7;sock.rotation.x=Math.sin(t*3)*0.1;});}
  {const g=new THREE.Group();g.add(scl(at(sph(1,'#8F8A9E',8,6),0,-0.2,0),1.4,0.6,1.1));
   const seal=new THREE.Group();seal.add(scl(at(sph(0.3,'#6B6F80',8,6),0,0,0),0.8,0.7,1.6));seal.add(at(sph(0.2,'#6B6F80',8,6),0,0.25,0.45));
   for(const s of[-1,1]){seal.add(at(sph(0.04,'#1D1533',4,3,{ol:false,shadow:false}),0.08*s,0.3,0.62));seal.add(rot(at(scl(sph(0.12,'#6B6F80',5,4,{ol:false}),0.3,0.2,1),0.25*s,-0.1,0.1),0,0.6*s,0));}
   seal.position.y=0.5;g.add(seal);g.position.set(15,-0.3,68);scene.add(g);
   F(g,{k:'seal',n:'the seal',c:['grey'],s:'long and blubbery',m:'blubber',v:'loves a sunbathe',snd:'arf-arf',u:'toss a fish to',e:'🦭🐟👏',r:['I bark, I clap my flippers, and I nap on rocks by the sea.']});
   W.movers.push(t=>{seal.rotation.z=Math.sin(t*0.7)*0.08;seal.children[1].position.y=0.25+Math.max(0,Math.sin(t*0.9))*0.12;});}
  {const g=G_(at(cyl(0.03,0.03,1.4,'#B08968',5,{ol:false}),0,0,0),at(scl(sph(0.15,'#B08968',6,5,{w:0.015}),1,1.8,0.3),0,0.75,0));g.rotation.z=Math.PI/2;g.position.set(1.1,0.62,63.5);g.rotation.y=0.3;scene.add(g);
   F(g,{k:'paddle',n:'the paddle',c:['brown'],s:'long and flat',m:'wood',v:'ready to row',snd:'splosh',u:'row a boat with',e:'🛶💦💪',r:['Dip me in the water and pull, and your little boat moves along.']});}
  {const [x,z]=beach(1.98,10.5);const g=new THREE.Group();for(const s of[-1,1])g.add(at(cyl(0.05,0.05,2.4,'#FFFFFF',5),2*s,1.2,0));
   const net=new THREE.Mesh(new THREE.PlaneGeometry(4,0.8,8,2),new THREE.MeshToonMaterial({color:'#2B2040',wireframe:true}));net.position.y=2;g.add(net);g.add(at(box(4,0.06,0.03,'#FFFFFF',{ol:false}),0,2.4,0));
   g.add(at(sph(0.2,'#FFD23F',8,6,{w:0.02}),1,0.2,1));
   place(g,x,z,2,{k:'volleyball net',n:'the volleyball net',c:['white','black'],s:'wide',m:'rope',v:'sporty',snd:'bump-set-spike',u:'bump a ball over',e:'🏐🥅🏖️',r:['I stretch across the sand, and you knock a ball over me.']},{ry:0.4});}
  {const [x,z]=beach(2.36,8.5);const g=G_(scl(at(sph(1.1,'#9B96AC',7,5),0,0.4,0),1.3,0.8,1),scl(at(sph(0.6,'#8F8A9E',6,4),0.9,0.2,0.4),1,0.8,1));
   place(g,x,z,1.3,{k:'boulder',n:'the big boulder',c:['grey'],s:'lumpy',m:'rock',v:'not going anywhere',u:'sit on and watch the waves',e:'🪨🌊🧗',r:['I’ve sat on this beach for a thousand years and I’ve never moved an inch.']});}

  /* ---------- Hillside ---------- */
  {const g=G_(at(box(1.4,1,1.2,'#C8793C'),0,0.5,0));const r=mk(prismGeo(1.6,0.6,1.4),'#7A2E2E');r.position.y=1;r.rotation.y=Math.PI/2;g.add(r);g.add(at(box(0.5,0.6,0.05,'#2B2040',{ol:false}),0,0.35,0.61));
   const s=signBox('REX',0.5,0.15,'#FFFFFF','#2B2040');s.position.set(0,0.8,0.62);g.add(s);
   const dh=place(g,6,-33,0.9,{k:'doghouse',n:'the doghouse',c:['brown','red'],s:'boxy',m:'wood',v:'cozy',snd:'woof',u:'keep a puppy dry in',e:'🐶🏠🦴',r:['A four-legged friend sleeps inside me with a bone.']});
   const p=new THREE.Group();p.add(scl(at(sph(0.2,'#E8C45A',8,6),0,0.18,0),1,0.7,1.4));p.add(at(sph(0.14,'#E8C45A',6,5),0,0.25,0.28));
   for(const s of[-1,1])p.add(at(scl(sph(0.06,'#8B5E3C',4,3,{ol:false}),0.6,1.4,0.6),0.1*s,0.3,0.25));p.add(at(sph(0.03,'#1D1533',4,3,{ol:false}),0,0.25,0.42));
   place(p,dh.position.x+0.2,dh.position.z+1.1,0.3,{k:'puppy',n:'the sleeping puppy',c:['gold'],s:'curled up',m:'fur',v:'dreaming of bones',snd:'snore',u:'let sleep in the sun',e:'🐕💤🦴',r:['I’m a little dog curled up asleep outside my wooden house.']},{solid:false});}
  {const g=new THREE.Group();for(let i=0;i<4;i++)g.add(rot(at(mk(new THREE.TorusGeometry(0.35-i*0.05,0.04,5,14),'#3DDC97',{w:0.01}),0,0.05+i*0.06,0),Math.PI/2,0,0));g.add(at(cyl(0.05,0.05,0.15,'#FFD23F',6,{ol:false}),0.3,0.05,0));
   place(g,-10.5,-34.8,0.4,{k:'hose',n:'the garden hose',c:['green'],s:'coiled',m:'rubber',v:'all tangled up',snd:'fssssh',u:'water the flowers with',e:'🐍💦🌷',r:['I look like a green snake, but I spray water, not venom.']},{solid:false});}
  {const g=G_(at(sph(0.5,'#3E9E4A',8,6),0,0.45,0));for(let i=0;i<7;i++){const a=i*0.9;g.add(at(sph(0.1,'#E8323F',6,5,{w:0.01}),Math.cos(a)*0.4,0.45+Math.sin(i*1.7)*0.25,Math.sin(a)*0.4));}
   place(g,12,-35.5,0.5,{k:'rose bush',n:'the rose bush',c:['red','green'],s:'round',m:'petals',v:'romantic but prickly',u:'pick a flower from carefully',e:'🌹🌿🥀',r:['My flowers smell sweet, but my thorns will prick you.']});}
  {const g=new THREE.Group();g.add(at(cyl(0.12,0.12,0.03,'#8B5E3C',8,{ol:false}),0,0,0));const tubes=[];for(let i=0;i<5;i++){const a=i/5*TAU;const t=at(cyl(0.02,0.02,0.3+i*0.04,'#C8D4E0',5,{ol:false}),Math.cos(a)*0.09,-0.25,Math.sin(a)*0.09);g.add(t);tubes.push(t);}
   g.position.set(1.4,landH(0,-38)+3.1,-35.2);scene.add(g);
   F(g,{k:'wind chime',n:'the wind chime',c:['silver'],s:'dangly',m:'metal',v:'peaceful',snd:'ting-a-ling',u:'hear the breeze with',e:'🎐🌬️🎶',r:['I hang by a door and sing every time the wind passes by.']});
   W.movers.push(t=>{tubes.forEach((b,i)=>{b.rotation.z=Math.sin(t*2+i)*0.15;});});}
  {const g=new THREE.Group();g.add(scl(at(sph(0.3,'#9B96AC',8,6),0,0.2,0),1.2,0.7,1));for(const s of[-1,1]){g.add(at(sph(0.1,'#9B96AC',6,5),0.15*s,0.4,0.15));g.add(at(sph(0.04,'#2B2040',4,3,{ol:false}),0.15*s,0.44,0.24));}
   place(g,-17,-34.5,0.35,{k:'frog statue',n:'the stone frog',c:['grey'],s:'squat',m:'stone',v:'frozen mid-ribbit',u:'decorate a garden with',e:'🐸🗿🌿',r:['I look like I’m about to hop, but I’m made of stone.']},{solid:false});}
  {const g=new THREE.Group();g.add(flat(1,0.6,'#8B5E3C'));const t=canvasTex(128,80,(x)=>{x.fillStyle='#8B5E3C';x.fillRect(0,0,128,80);x.fillStyle='#F2E6C9';x.font='26px "Lilita One",sans-serif';x.textAlign='center';x.fillText('WELCOME',64,50);});
   const m=new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.55),MT(t,{transparent:true}));m.rotation.x=-Math.PI/2;m.position.y=0.04;g.add(m);
   g.position.set(-10.5,landH(-10.5,-35.2)+0.02,-35.1);scene.add(g);
   F(g,{k:'mat',n:'the welcome mat',c:['brown'],s:'flat',m:'fabric',v:'always polite',u:'wipe your feet on',e:'👟🏠👋',r:['I lie by the front door and say hello to everyone’s shoes.']});}
  {const g=new THREE.Group();g.add(at(cyl(0.35,0.5,3.5,'#8B5E3C',8),0,1.75,0));g.add(at(sph(2.2,'#4FAF52',8,6),0,4.8,0));
   g.add(at(box(2,1.3,1.6,'#C8935E'),0,3.8,0.2));const r=mk(prismGeo(2.3,0.8,1.9),'#7A2E2E');r.position.set(0,4.45,0.2);g.add(r);g.add(at(box(0.5,0.6,0.05,'#2B2040',{ol:false}),0,3.7,1.02));
   for(let i=0;i<6;i++)g.add(at(box(0.5,0.06,0.08,'#B08968',{ol:false}),0.45,0.4+i*0.5,0.32));
   place(g,-23.5,-30,1.2,{k:'treehouse',n:'the treehouse',c:['brown','green'],s:'boxy',m:'wood',v:'secret club only',snd:'creak',u:'hold a secret meeting in',e:'🌳🏠🤫',r:['I’m a little house built up in the branches, for kids only.']});}
  {const g=new THREE.Group();g.add(at(box(2,0.12,1,'#B08968'),0,0.8,0));for(const s of[-1,1]){g.add(at(box(2,0.1,0.35,'#B08968'),0,0.45,0.75*s));g.add(at(box(0.1,0.8,0.9,'#8B5E3C',{w:0.02}),0.85*s,0.4,0));}
   g.add(at(cyl(0.15,0.15,0.2,'#FF5D73',8,{w:0.015}),0.4,0.96,0));
   place(g,5.5,-28.5,1.1,{k:'picnic table',n:'the picnic table',c:['brown'],s:'long',m:'wood',v:'ready for lunch',u:'eat a sandwich at',e:'🧺🪑🥪',r:['I have benches stuck to my sides so you can eat outdoors.']});}
  {const g=G_(at(box(2.2,1.9,1.8,'#7FA8C9'),0,0.95,0));const r=mk(prismGeo(2.5,0.7,2),'#4D5B7A');r.position.y=1.9;g.add(r);g.add(at(box(0.8,1.5,0.06,'#FFFFFF',{w:0.02}),-0.4,0.75,0.92));g.add(at(box(0.5,0.4,0.06,'#BFE9FF',{w:0.02}),0.6,1.2,0.92));
   place(g,20,-30.5,1.4,{k:'shed',n:'the garden shed',c:['blue'],s:'boxy',m:'wood',v:'full of cobwebs',snd:'creak',u:'keep the lawnmower in',e:'🛖🧹🕸️',r:['I’m a little hut where rakes, spades and spiders live.']});}
  {const g=new THREE.Group();for(const s of[-1,1]){g.add(rot(at(mk(new THREE.TorusGeometry(0.4,0.05,6,14),'#2B2040',{w:0.015}),0.7*s,0.45,0),0,Math.PI/2,0));}
   g.add(rot(at(cyl(0.05,0.05,1.3,'#E8323F',5,{w:0.015}),0,0.75,0),0,0,Math.PI/2.2));g.add(at(box(0.3,0.06,0.15,'#2B2040',{ol:false}),-0.5,1.05,0));g.add(at(box(0.08,0.4,0.5,'#2B2040',{ol:false}),0.75,1.1,0));
   place(g,-12.5,-30,0.8,{k:'bicycle',n:'the red bicycle',c:['red'],s:'wheely',m:'metal',v:'eager to go downhill',snd:'ring-ring',u:'ride down the hill on',e:'🚲🟥⛰️',r:['I have two wheels and a bell, and I’m the colour of a fire truck.']},{ry:-0.4});}
  {const g=G_(at(cyl(0.35,0.28,0.35,'#B08968',10,{w:0.015}),0,0.18,0));for(const [x,c] of[[-0.1,'#FF5D73'],[0.1,'#4D96FF'],[0,'#FFD23F']])g.add(at(box(0.3,0.08,0.25,c,{ol:false}),x,0.38,(x*2)));
   place(g,-5.5,-32.3,0.35,{k:'laundry basket',n:'the laundry basket',c:['brown'],s:'round',m:'wicker',v:'overflowing',u:'carry the washing in',e:'🧺👕🧦',r:['I carry the wet clothes out to the washing line.']},{solid:false});}

  /* ---------- The Park ---------- */
  {const g=G_(at(cyl(0.25,0.25,0.03,'#FF5D73',14,{w:0.01}),0,0.02,0));place(g,-33,18.5,0.25,{k:'frisbee',n:'the frisbee',c:['pink'],s:'flat and round',m:'plastic',v:'ready to fly',snd:'whoosh',u:'throw to a friend',e:'🥏🐕💨',r:['I’m a flying plate you throw to a friend or a dog.']},{solid:false});}
  {const t=canvasTex(64,32,(x)=>{x.fillStyle='#FFFFFF';x.fillRect(0,0,64,32);x.fillStyle='#2B2040';for(let i=0;i<6;i++){x.beginPath();x.arc((i*23)%64,(i*13)%32,5,0,TAU);x.fill();}});
   const b=mk(new THREE.SphereGeometry(0.22,12,10),0,{mat:MT(t),w:0.015});b.position.y=0.22;place(G_(b),-29,12.5,0.25,{k:'ball',n:'the soccer ball',c:['black','white'],s:'round',m:'leather',v:'kicked around a lot',snd:'boing',u:'score a goal with',e:'⚽🥅🏃',r:['Kick me into the net and everyone cheers.']},{solid:false});}
  {const g=new THREE.Group();for(const s of[-1,1])g.add(at(cyl(0.07,0.07,1.6,'#FFFFFF',6),1.6*s,0.8,0));g.add(rot(at(cyl(0.07,0.07,3.3,'#FFFFFF',6),0,1.6,0),0,0,Math.PI/2));
   const net=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.6,8,4),new THREE.MeshToonMaterial({color:'#E8E8F0',wireframe:true}));net.position.set(0,0.8,-0.5);net.rotation.x=0.4;g.add(net);
   place(g,-31,15.5,1.8,{k:'goal',n:'the soccer goal',c:['white'],s:'wide',m:'metal',v:'waiting for a winner',snd:'swish',u:'kick a ball into',e:'🥅⚽🎉',r:['Get the ball past the keeper and into my net!']},{ry:0.3});}
  {const g=G_(at(cyl(0.18,0.22,0.9,'#8FA3B8',8),0,0.45,0),at(cyl(0.25,0.2,0.12,'#8FA3B8',10),0,0.95,0),at(cyl(0.02,0.02,0.15,'#C8D4E0',4,{ol:false}),0.08,1.08,0));
   place(g,-33,-7,0.3,{k:'drinking fountain',n:'the drinking fountain',c:['grey'],s:'short and round',m:'metal',v:'refreshing',snd:'glug',u:'take a sip from',e:'🚰💦😮‍💨',r:['Press my button and a little arc of water jumps up to your mouth.']});}
  {const g=new THREE.Group();for(let i=0;i<7;i++){const a=i/7*TAU;g.add(at(cyl(0.04,0.05,0.15,'#FFF7E6',5,{ol:false}),Math.cos(a)*0.6,0.07,Math.sin(a)*0.6));g.add(at(scl(sph(0.1,'#E8323F',6,4,{w:0.01}),1,0.6,1),Math.cos(a)*0.6,0.16,Math.sin(a)*0.6));}
   place(g,-46,-18,0.7,{k:'mushrooms',n:'the mushroom ring',c:['red','white'],s:'round',m:'fungus',v:'a bit magical',u:'make a fairy wish in',e:'🍄⭕🧚',r:['We grow in a circle, and fairies are said to dance inside us.']},{solid:false});}
  {const oak=W.list.find(o=>o.n==='the giant oak tree').obj;const g=G_(at(box(0.25,0.35,0.04,'#9B5DE5',{w:0.01}),0,0.18,0),at(sph(0.02,'#FFD23F',4,3,{ol:false}),0.07,0.18,0.03));
   g.position.set(oak.position.x,oak.position.y+0.02,oak.position.z+0.5);scene.add(g);
   F(g,{k:'fairy door',n:'the fairy door',c:['purple'],s:'tiny',m:'wood',v:'magical and secret',u:'knock very gently on',e:'🚪🧚✨',r:['I’m a tiny door at the bottom of a big tree, for very small visitors.']});}
  {const g=G_(scl(at(sph(0.06,'#E8323F',6,5,{w:0.01}),0,0,0),1,0.6,1.2));for(const [x,z] of[[0.02,0.02],[-0.02,-0.03]])g.add(at(sph(0.012,'#1D1533',3,2,{ol:false}),x,0.035,z));g.add(at(sph(0.025,'#1D1533',4,3,{ol:false}),0,0.01,0.07));
   g.position.set(-32.7,landH(-33,12)+0.64,12.1);scene.add(g);
   F(g,{k:'ladybug',n:'the ladybug',c:['red','black'],s:'tiny and round',m:'shell',v:'lucky',u:'let crawl across your hand',e:'🐞🍀🌿',r:['I’m tiny and red with black spots, and landing on you is lucky.']});}
  {const g=new THREE.Group();g.add(scl(at(sph(0.25,'#8B6B4A',8,6),0,0.18,0),1,0.75,1.3));for(let i=0;i<12;i++){const a=i*0.9;g.add(rot(at(cone(0.03,0.15,'#5B3A29',3,{ol:false}),Math.cos(a)*0.18,0.25+Math.sin(i)*0.05,-0.05+Math.sin(a)*0.2),-0.8,0,a));}
   g.add(at(scl(sph(0.1,'#D9B48A',6,5,{ol:false}),0.8,0.8,1.2),0,0.15,0.3));g.add(at(sph(0.03,'#1D1533',4,3,{ol:false}),0,0.16,0.42));
   place(g,-41,-1,0.3,{k:'hedgehog',n:'the hedgehog',c:['brown'],s:'spiky',m:'prickles',v:'shy',snd:'snuffle',u:'leave a saucer of water for',e:'🦔🍂🌙',r:['I’m covered in prickles and curl into a ball when I’m scared.']},{solid:false});}
  {const g=G_(at(cyl(0.04,0.04,1.8,'#8B5E3C',5,{ol:false}),0,0.9,0),at(box(0.5,0.35,0.35,'#FFD23F'),0,1.75,0),at(prismGeo?mk(prismGeo(0.6,0.25,0.45),'#E8323F'):box(0.6,0.1,0.4,'#E8323F'),0,1.92,0),at(box(0.4,0.04,0.2,'#8B5E3C',{ol:false}),0,1.58,0.25));
   for(let i=0;i<4;i++)g.add(at(sph(0.03,'#C8A06A',4,3,{ol:false}),-0.12+i*0.08,1.62,0.3));
   place(g,-39,-17,0.3,{k:'bird feeder',n:'the bird feeder',c:['yellow','red'],s:'boxy',m:'wood',v:'always serving snacks',snd:'peck-peck',u:'feed the birds from',e:'🐦🌰🍽️',r:['I’m a little seed café on a pole where birds stop for lunch.']});}
  {const pic=W.list.find(o=>o.n==='the picnic basket').obj;const g=new THREE.Group();g.add(scl(at(sph(0.16,'#C8793C',8,6),0,0.16,0),1,1.1,0.8));g.add(at(sph(0.12,'#C8793C',6,5),0,0.38,0));
   for(const s of[-1,1]){g.add(at(sph(0.05,'#C8793C',4,3),0.09*s,0.48,0));g.add(at(sph(0.06,'#C8793C',4,3),0.17*s,0.2,0.05));g.add(at(sph(0.06,'#C8793C',4,3),0.08*s,0.03,0.08));}
   g.add(at(sph(0.02,'#1D1533',3,2,{ol:false}),0,0.39,0.11));const wp=worldAt(pic,-0.9,0,0.6);g.position.set(wp.x,landH(wp.x,wp.z)+0.05,wp.z);g.rotation.y=pic.rotation.y+0.5;scene.add(g);
   F(g,{k:'teddy',n:'the teddy bear',c:['brown'],s:'cuddly',m:'fluff',v:'waiting for a hug',u:'cuddle at bedtime',e:'🧸💤❤️',r:['Somebody left me at the picnic, and I’m waiting for a bedtime hug.']});}
  {const sq=W.list.find(o=>o.n==='the squirrel');const tx=-27,tz=-18;const g=new THREE.Group();const k=mk(new THREE.ConeGeometry(0.4,0.8,4,1),'#4D96FF',{w:0.02});k.scale.z=0.12;g.add(k);
   g.add(at(box(0.3,0.08,0.02,'#FFD23F',{ol:false}),0,-0.6,0));g.position.set(tx+0.7,landH(tx,tz)+3.3,tz+0.6);g.rotation.z=0.8;scene.add(g);
   F(g,{k:'kite',n:'the stuck kite',c:['blue'],s:'diamond-shaped',m:'paper',v:'hopelessly tangled',u:'rescue with a long stick',e:'🪁🌳😩',r:['I wanted to fly, but a tree caught me by the tail.']});}
  {const g=new THREE.Group();g.add(at(cyl(3,3,0.3,'#FFFFFF',10),0,0.15,0));for(let i=0;i<8;i++){const a=i/8*TAU;g.add(at(cyl(0.1,0.1,2.8,'#FFFFFF',5),Math.cos(a)*2.8,1.7,Math.sin(a)*2.8));}
   g.add(at(cone(3.5,1.6,'#4D96FF',8),0,3.9,0));g.add(at(sph(0.25,'#FFD23F',6,5),0,4.8,0));
   place(g,-45,-25,3.1,{k:'bandstand',n:'the bandstand',c:['white','blue'],s:'round',m:'wood',v:'musical',snd:'oompah-pah',u:'play a concert in',e:'🎺🎶🎪',r:['A brass band plays under my round roof on sunny Sundays.']});}
  {const g=new THREE.Group();const c=new THREE.Shape();c.moveTo(-2,0);c.quadraticCurveTo(0,0,2,1.6);c.lineTo(2,0);c.lineTo(-2,0);
   const ramp=mk(new THREE.ExtrudeGeometry(c,{depth:2,bevelEnabled:false}),'#8FA3B8');ramp.position.z=-1;g.add(ramp);g.add(at(box(0.1,0.1,2,'#2B2040',{ol:false}),2,1.6,0));
   place(g,-19.5,-9,2.2,{k:'skate ramp',n:'the skate ramp',c:['grey'],s:'curved',m:'metal',v:'totally rad',snd:'swoosh',u:'do tricks on',e:'🛹⤴️😎',r:['Skaters roll up my curve and fly into the air.']},{ry:0.5});}
  {const g=new THREE.Group();g.add(at(cyl(2.4,2.4,0.3,'#FFD23F',12),0,0.3,0));g.add(at(cyl(0.2,0.2,3,'#FFD23F',8),0,1.8,0));
   const top=mk(new THREE.ConeGeometry(2.8,1.2,12),0,{mat:MT(stripeTex('#E8323F','#FFFFFF',12))});top.position.y=3.6;g.add(top);
   const spin=new THREE.Group();for(let i=0;i<6;i++){const a=i/6*TAU;const h=new THREE.Group();h.add(at(cyl(0.04,0.04,2.6,'#C8D4E0',4,{ol:false}),0,1.4,0));
     h.add(scl(at(sph(0.35,['#FFFFFF','#FFB3C7','#BFE9FF'][i%3],8,6),0,0.9,0),0.6,0.7,1.3));h.add(at(sph(0.15,['#FFFFFF','#FFB3C7','#BFE9FF'][i%3],6,5),0,1.25,0.35));h.position.set(Math.cos(a)*1.7,0.4,Math.sin(a)*1.7);h.rotation.y=-a;spin.add(h);}
   g.add(spin);
   place(g,-47.5,-3,2.6,{k:'carousel',n:'the carousel',c:['red','white','yellow'],s:'round',m:'wood',v:'going round and round',snd:'la-la-la organ music',u:'ride a painted horse on',e:'🎠🎡🎶',r:['My painted horses go up and down and round and round, but never get anywhere.']});
   W.movers.push(t=>{spin.rotation.y=t*0.5;spin.children.forEach((h,i)=>{h.children[1].position.y=0.9+Math.sin(t*2+i)*0.25;h.children[2].position.y=1.25+Math.sin(t*2+i)*0.25;});});}
  {const g=new THREE.Group();const cols=['#E8323F','#FFD23F','#3DDC97','#4D96FF'];for(let i=0;i<4;i++){g.add(at(cyl(0.45,0.5,1.1,cols[i],8),0,0.55+i*1.1,0));
     for(const s of[-1,1])g.add(at(sph(0.08,'#2B2040',4,3,{ol:false}),0.18*s,0.75+i*1.1,0.45));g.add(at(box(0.2,0.08,0.1,'#2B2040',{ol:false}),0,0.4+i*1.1,0.47));}
   for(const s of[-1,1])g.add(rot(at(box(1.1,0.12,0.4,'#FF9F1C'),0.8*s,4.2,0),0,0,s*0.3));
   place(g,-25.5,31,0.6,{k:'totem pole',n:'the totem pole',c:['red','yellow','green','blue'],s:'tall',m:'wood',v:'watching everything',u:'tell a story with',e:'🪵👀🦅',r:['I’m a tall carved post with faces stacked on top of each other.']});}
}
