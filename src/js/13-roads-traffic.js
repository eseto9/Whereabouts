/* =========================================================
   Ring road, vehicles, sky traffic
   ========================================================= */
function buildRoads(){
  const tex=canvasTex(64,128,(x,W,H)=>{x.fillStyle='#6D6690';x.fillRect(0,0,W,H);x.fillStyle='#FFFFFF';x.fillRect(29,0,6,64);x.fillStyle='#5E587F';x.fillRect(0,0,4,H);x.fillRect(W-4,0,4,H);});
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  const pts=[];for(let i=0;i<200;i++){const a=i/200*TAU;pts.push([Math.cos(a)*26,Math.sin(a)*26]);}
  ribbon(pts,5,MT(tex),true,0.09);

  // delivery van
  {const g=new THREE.Group();
   g.add(at(box(1.8,1.6,3.4,'#FFFFFF'),0,1.2,-0.3));g.add(at(box(1.8,1.1,1.2,'#FF9F1C'),0,0.95,1.9));
   g.add(at(box(1.6,0.5,0.1,'#BFE9FF',{ol:false}),0,1.3,2.5));
   const s=signBox('Zip Zap Delivery',3.2,0.6,'#FF9F1C','#2B2040');s.position.set(0.93,1.4,-0.3);s.rotation.y=Math.PI/2;g.add(s);
   const s2=s.clone();s2.position.x=-0.93;s2.rotation.y=-Math.PI/2;g.add(s2);
   const wheels=[];for(const x of[-0.9,0.9])for(const z of[-1.3,1.6]){const w=rot(at(cyl(0.38,0.38,0.3,'#2B2040',10),x,0.38,z),0,0,Math.PI/2);g.add(w);wheels.push(w);}
   scene.add(g);
   F(g,{k:'van',n:'the delivery van',c:['orange','white'],s:'boxy',m:'metal',v:'running late, as usual',snd:'beep-beep',u:'send a parcel with',e:'📦🚚💨',r:'I drive in circles all day and every stop is a special delivery.',mv:true});
   W.movers.push(t=>{const a=t*0.16;const x=Math.cos(a)*24.8,z=Math.sin(a)*24.8;g.position.set(x,landH(x,z)+0.1,z);g.rotation.y=Math.atan2(-Math.sin(a),Math.cos(a));
     const ahead=a+0.05;const hx=Math.cos(ahead)*24.8,hz=Math.sin(ahead)*24.8;g.rotation.x=-Math.atan2(landH(hx,hz)-landH(x,z),24.8*0.05);wheels.forEach(w=>w.rotation.x=t*6);});}
  // cyclist
  {const g=new THREE.Group();
   for(const z of[-0.6,0.6]){const w=mk(new THREE.TorusGeometry(0.42,0.06,5,14),'#2B2040',{ol:false});w.rotation.y=Math.PI/2;w.position.set(0,0.45,z);g.add(w);}
   g.add(rot(at(cyl(0.05,0.05,1.3,'#FF5D73',5,{ol:false}),0,0.8,0),Math.PI/2.3,0,0));g.add(at(box(0.12,0.08,0.3,'#2B2040',{ol:false}),0,1.05,-0.3));
   const rider=npc('#4D96FF','#FF5D73');rider.scale.setScalar(0.8);rider.position.set(0,0.4,-0.2);g.add(rider);
   g.add(at(box(0.5,0.35,0.4,'#C8935E',{w:0.02}),0,0.9,0.7));
   scene.add(g);
   F(g,{k:'cyclist',n:'the cyclist',c:['blue','red'],s:'wheely',m:'metal',v:'breezy and in no rush',snd:'ring-ring',u:'wave hello to',e:'🚲🔔🌬️',mv:true});
   W.movers.push(t=>{const a=-t*0.2+1;const x=Math.cos(a)*27.4,z=Math.sin(a)*27.4;g.position.set(x,landH(x,z)+0.1,z);g.rotation.y=Math.atan2(Math.sin(a),-Math.cos(a));});}
  // mail carrier walking the market
  {const m=npc('#2E5AAC','#2E5AAC');const bag=at(box(0.5,0.45,0.2,'#8B5E3C',{w:0.02}),0.35,0.9,0);m.add(bag);scene.add(m);
   F(m,{k:'mail carrier',n:'the mail carrier',c:['blue'],s:'tall',m:'uniform',v:'hardworking',snd:'knock-knock',u:'hand a letter to',e:'📬🚶✉️',mv:true});
   const path=loopPath([{p:[9,0,2.6],d:9},{p:[26,0,1.8],d:14},{p:[52,0,1.8],d:3},{p:[52,0,-1.8],d:14},{p:[26,0,-1.8],d:9},{p:[9,0,-2.6],d:4},{p:[9,0,2.6],d:0.01}]);
   const tmp=new V3();
   W.movers.push(t=>{const r=path(t,tmp);m.position.set(tmp.x,landH(tmp.x,tmp.z)+(r.moving?Math.abs(Math.sin(t*8))*0.06:0),tmp.z);if(r.moving)m.rotation.y=Math.atan2(r.dx,r.dz);
     m.userData.arms[0].rotation.x=r.moving?Math.sin(t*8)*0.6:0;m.userData.arms[1].rotation.x=r.moving?-Math.sin(t*8)*0.6:0;});}
  // hot air balloon
  {const g=new THREE.Group();const et=stripeTex('#FF5D73','#FFD23F',10);
   const env=mk(new THREE.SphereGeometry(4,16,12),0,{mat:MT(et),w:0.12});env.scale.y=1.2;env.position.y=6;g.add(env);
   g.add(at(box(1.8,1.2,1.8,'#B5793A',{w:0.06}),0,0.6,0));
   for(const [x,z] of[[-0.8,-0.8],[0.8,-0.8],[-0.8,0.8],[0.8,0.8]])g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new V3(x,1.2,z),new V3(x*2.8,3.4,z*2.8)]),new THREE.LineBasicMaterial({color:0x2B2040})));
   scene.add(g);
   F(g,{k:'hot air balloon',n:'the hot air balloon',c:['red','yellow'],s:'round',m:'fabric',v:'floaty and full of hot air',snd:'whoosh (burner)',u:'drift over the town in',e:'🎈🧺🔥',r:"I'm full of hot air and I carry people in a basket.",mv:true});
   W.movers.push(t=>{const a=t*0.018;g.position.set(Math.cos(a)*62,30+Math.sin(t*0.3)*2,Math.sin(a)*48);});}
  // blimp with banner
  {const g=new THREE.Group();const b=sph(3,'#9B5DE5',16,12,{w:0.12});b.scale.set(1,1,3);g.add(b);
   for(const s of[-1,1])g.add(rot(at(box(0.2,2.4,1.8,'#FFD23F',{w:0.06}),1.4*s,0,-7.6),0,0,s*0.6));g.add(at(box(0.2,2.6,1.8,'#FFD23F',{w:0.06}),0,1.4,-7.6));
   g.add(at(box(1.2,0.9,2.6,'#FFFFFF',{w:0.06}),0,-3.2,0));
   const ban=new THREE.Mesh(new THREE.PlaneGeometry(12,2.2),new THREE.MeshBasicMaterial({map:signTex('Find it in Whereabouts!','#FFFFFF','#2B2040',1024,190),side:THREE.DoubleSide}));
   ban.rotation.y=Math.PI/2;ban.position.set(0,-6,-14);g.add(ban);
   scene.add(g);
   F(g,{k:'blimp',n:'the blimp',c:['purple','yellow'],s:'long and puffy',m:'fabric',v:'slow and very chill',snd:'hummm',u:'advertise something with',e:'🎈🟣📢',mv:true});
   W.movers.push(t=>{const u=((t*3.2)%460)-230;g.position.set(u,54,-30+Math.sin(t*0.05)*10);g.rotation.y=Math.PI/2;});}
}

