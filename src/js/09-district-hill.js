/* =========================================================
   Hillside Houses
   ========================================================= */
function house(x,z,body,roof,meta,extra){
  const g=new THREE.Group();const w=6,d=5,h=4.2;
  g.add(at(box(w,h,d,body),0,h/2,0));
  const r=mk(prismGeo(w+0.6,2.2,d+0.6),roof);r.position.y=h;g.add(r);
  g.add(at(box(1.1,1.9,0.2,'#8A5A44',{w:0.03}),0,0.95,d/2+0.05));
  for(const wx of[-w/2+1.2,w/2-1.2]){g.add(at(box(1.1,1.1,0.15,'#BFE9FF',{w:0.03}),wx,h*0.62,d/2+0.05));g.add(at(box(1.2,0.3,0.3,'#B5654C',{w:0.02}),wx,h*0.42,d/2+0.2));}
  g.add(at(box(0.7,1.6,0.7,'#B5654C'),w/2-1.3,h+1.4,-0.9));
  if(extra)extra(g,h);
  onGround(g,x,z);F(g,meta);rect(x,z,w+0.2,d+0.2);return g;
}
function buildHill(){
  const H=[
    [-21,-38,'#FFB3C7','#E84A6F','pink','sweet as candy'],
    [-10.5,-38,'#A7C7FF','#FFCB47','blue','calm and collected'],
    [0,-38,'#FFE37A','#5AA9E6','yellow','bright and bubbly'],
    [10.5,-38,'#A8EBD0','#E8684A','mint','fresh-faced'],
    [21,-38,'#D5C2FF','#5E4BD8','lavender','dreamy'],
    [-15,-48.5,'#FFC9A0','#3D8D7A','peach','cozy'],
    [-4,-48.5,'#F7F4EF','#B24A4A','white','a bit old-fashioned'],
    [7,-48.5,'#7FD4D4','#F28FAD','teal','cool as a cucumber'],
    [18,-48.5,'#FF9F80','#2B6CB0','coral','quietly confident'],
  ];
  const roofTops=[];
  H.forEach(([x,z,b,r,cn,vibe],i)=>{
    house(x,z,b,r,{k:'house',n:`the ${cn} house`,c:[cn],s:'boxy',m:'brick',v:vibe,snd:'knock-knock',u:'live in',e:'🏠🔑'+['🍬','🧊','🌞','🌿','💜','🍑','🕰️','🥒','🐚'][i]},
      i===5?(g,h)=>{const ant=grp(at(cyl(0.04,0.04,1.6,'#2B2040',4,{ol:false}),0,0.8,0),rot(at(box(1,0.05,0.05,'#2B2040',{ol:false}),0,1.4,0),0,0.4,0));ant.position.set(1.8,h+1.6,-0.9);g.add(ant);}:null);
    roofTops.push([x,landH(x,z)+6.45,z]);
  });
  // cat that roams the rooftops
  {const c=catMesh();scene.add(c);
   const R=roofTops.slice(0,5);const keys=[];
   for(let i=0;i<5;i++){const p=R[i];
     keys.push({p:[p[0],p[1],-39.8],d:3});
     keys.push({p:[p[0],p[1],-36.4],d:i===2?9:1.6});
     if(i<4) keys.push({p:[p[0],p[1],-36.4],d:1.4,hop:2.5});
   }
   const last=R[4],first=R[0];
   keys.push({p:[last[0],last[1],-36.4],d:1.6,hop:2});
   keys.push({p:[last[0]+3,landH(last[0]+3,-33.8),-33.8],d:18});
   keys.push({p:[first[0]-3,landH(first[0]-3,-33.8),-33.8],d:1.6,hop:3});
   const path=loopPath(keys);
   const tmp=new V3();
   F(c,{k:'cat',n:'the orange cat',c:['orange'],s:'curled up',m:'fur',v:'extremely smug',snd:'meow',u:'give a chin scratch',e:'😼☀️🏠',r:'I nap in the sun and judge you from the rooftops.',mv:true});
   W.movers.push(t=>{const r=path(t,tmp);c.position.copy(tmp);if(r.moving)c.rotation.y=Math.atan2(r.dx,r.dz);c.userData.tail.rotation.z=Math.sin(t*3)*0.4;});}
  // laundry line
  {const g=new THREE.Group();const y0=landH(-5,-33.6);
   g.add(at(cyl(0.08,0.08,2.8,'#8B5E3C',6),-3,1.4,0));g.add(at(cyl(0.08,0.08,2.8,'#8B5E3C',6),3,1.4,0));
   g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new V3(-3,2.6,0),new V3(3,2.6,0)]),new THREE.LineBasicMaterial({color:0x2B2040})));
   const clothes=[];[['#FF5D73',1],['#4D96FF',0],['#FFD23F',1],['#3DDC97',0],['#FFFFFF',1]].forEach(([c,shirt],i)=>{const p=new THREE.Group();p.position.set(-2.3+i*1.15,2.6,0);
     const piece=shirt?grp(at(box(0.7,0.8,0.05,c,{w:0.02}),0,-0.45,0),at(box(1,0.25,0.05,c,{w:0.02}),0,-0.15,0)):grp(at(box(0.3,0.9,0.05,c,{w:0.02}),-0.18,-0.5,0),at(box(0.3,0.9,0.05,c,{w:0.02}),0.18,-0.5,0));
     p.add(piece);g.add(p);clothes.push(p);});
   g.position.set(-5,y0,-33.6);scene.add(g);
   F(g,{k:'laundry',n:'the laundry line',c:['red','blue','yellow'],s:'dangly',m:'cotton',v:'hung out to dry',snd:'flap-flap',u:'dry your socks on',e:'👕🌬️☀️',r:"I'm washed, I'm wet, and now I'm just hanging around.",mv:true});
   circ(-8,-33.6,0.3);circ(-2,-33.6,0.3);
   W.movers.push(t=>{clothes.forEach((p,i)=>{p.rotation.x=0.25+Math.sin(t*3+i)*0.25;});});}
  // windmill
  {const g=new THREE.Group();
   g.add(at(cyl(1.5,2.4,7,'#F4E8D8',8),0,3.5,0));g.add(rot(at(cone(2,2,'#B5654C',8),0,8,0),0,0.4,0));
   g.add(at(box(1,1.6,0.2,'#8A5A44',{w:0.03}),0,0.8,2.2));
   const hub=new THREE.Group();hub.position.set(0,6.8,1.9);hub.add(at(sph(0.35,'#2B2040',8,6),0,0,0));
   for(let i=0;i<4;i++){const b=grp(at(box(0.7,4,0.08,'#FFFFFF',{w:0.03}),0.2,2.2,0),at(box(0.1,4.3,0.12,'#8B5E3C',{w:0.02}),-0.2,2.1,0));b.rotation.z=i*Math.PI/2;hub.add(b);}
   g.add(hub);onGround(g,28,-33);g.rotation.y=-0.9;
   F(g,{k:'windmill',n:'the windmill',c:['cream','white'],s:'tall',m:'wood',v:'always busy, going nowhere',snd:'whum-whum',u:'grind flour with',e:'🌬️🔄🌾',r:'I wave my arms all day long but never go anywhere.',mv:true});
   circ(28,-33,2.4);
   W.movers.push(t=>{hub.rotation.z=-t*1.2;});}
  // telescope viewpoint
  {const g=new THREE.Group();
   for(let i=0;i<3;i++){const a=i/3*TAU;g.add(rot(at(cyl(0.05,0.05,1.4,'#2B2040',5,{ol:false}),Math.cos(a)*0.3,0.65,Math.sin(a)*0.3),Math.sin(a)*0.35,0,-Math.cos(a)*0.35));}
   g.add(rot(at(cyl(0.12,0.22,1.4,'#E3B04B',10),0,1.45,0.3),1.2,0,0));
   onGround(g,-4,-30.5);g.rotation.y=0.2;
   F(g,{k:'telescope',n:'the telescope',c:['gold'],s:'long',m:'brass',v:'curious about everything',u:'peek at faraway things through',e:'🔭👁️🌙',r:'Look into me and faraway things come close.'});
   circ(-4,-30.5,0.6);}
  // painter + easel
  {const p=npc('#F15BB5','#2B2040');onGround(p,10,-31);p.rotation.y=Math.PI*0.85;
   const art=canvasTex(128,128,(x,W,H)=>{x.fillStyle='#FFFDF3';x.fillRect(0,0,W,H);['#FF5D73','#4D96FF','#FFD23F','#3DDC97'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(30+i*22,60+Math.sin(i)*20,18,0,TAU);x.fill();});x.fillStyle='#7ED957';x.fillRect(0,95,W,33);});
   const easel=new THREE.Group();easel.add(rot(at(cyl(0.04,0.04,2,'#8B5E3C',5,{ol:false}),-0.4,1,0),0.1,0,0.15));easel.add(rot(at(cyl(0.04,0.04,2,'#8B5E3C',5,{ol:false}),0.4,1,0),0.1,0,-0.15));
   const cv=new THREE.Mesh(new THREE.BoxGeometry(1.1,0.9,0.05),[M('#FFFFFF'),M('#FFFFFF'),M('#FFFFFF'),M('#FFFFFF'),MT(art),M('#FFFFFF')]);cv.position.set(0,1.5,0.1);outline(cv,0.03);easel.add(cv);
   easel.position.set(0,0,1.1);p.add(easel);
   F(p,{k:'painter',n:'the painter',c:['pink'],s:'tall',m:'smock',v:'deep in thought',snd:'swish',u:'ask for a portrait from',e:'🎨🖌️🖼️'});
   circ(10,-31,0.9);
   W.movers.push(t=>{p.userData.arms[1].rotation.x=-1.1+Math.sin(t*4)*0.25;});}
  // garden gnome
  {const g=new THREE.Group();g.add(at(cone(0.35,0.7,'#4D96FF',8),0,0.35,0));g.add(at(sph(0.2,'#F5C9A0',8,6),0,0.8,0));
   g.add(rot(at(cone(0.2,0.35,'#FFFFFF',6),0,0.65,0.14),Math.PI,0,0));g.add(at(cone(0.22,0.55,'#FF3B3B',8),0,1.15,0));
   onGround(g,-14,-33);g.rotation.y=0.3;
   F(g,{k:'gnome',n:'the garden gnome',c:['red','blue'],s:'pointy',m:'clay',v:'mischievous',u:'guard the garden with',e:'🧔🍄🔴'});}
  // birdhouse
  {const g=new THREE.Group();g.add(at(box(0.15,2.2,0.15,'#8B5E3C'),0,1.1,0));g.add(at(box(0.8,0.8,0.8,'#FFD23F'),0,2.5,0));
   const r=mk(prismGeo(1,0.5,1),'#FF5D73');r.position.y=2.9;g.add(r);g.add(at(cyl(0.14,0.14,0.05,'#2B2040',10,{ol:false}),0,2.55,0.41).rotateX(Math.PI/2));
   onGround(g,15,-33);
   F(g,{k:'birdhouse',n:'the birdhouse',c:['yellow','red'],s:'boxy',m:'wood',v:'tiny but welcoming',snd:'tweet',u:'give a bird a home',e:'🐦🏠🎈'});
   circ(15,-33,0.3);}
  // cactus on a doorstep
  {const g=new THREE.Group();g.add(at(cyl(0.3,0.24,0.4,'#C8703F',8),0,0.2,0));g.add(at(cap(0.16,0.5,'#3E9E4A'),0,0.75,0));
   g.add(rot(at(cap(0.08,0.2,'#3E9E4A'),0.2,0.8,0),0,0,-0.9));g.add(at(sph(0.06,'#F15BB5',5,4,{ol:false}),0,1.1,0));
   onGround(g,-8.6,-35.2);
   F(g,{k:'cactus',n:'the little cactus',c:['green'],s:'spiky',m:'plant',v:'a bit prickly',u:'water once a month',e:'🌵🤚😬',r:"Hug me and you'll regret it."});}
  // kite kid + kite
  {const k=npc('#3DDC97','#FF9F1C');onGround(k,-30,-40);k.rotation.y=Math.PI;
   k.userData.arms[1].rotation.set(-2.4,0,0.3);
   F(k,{k:'kid',n:'the kid flying a kite',c:['green','orange'],s:'small',m:'cotton',v:'full of joy',snd:'wheee',u:'lend a hand to',e:'🧒🌬️🎉'});
   circ(-30,-40,0.6);
   const kite=new THREE.Group();const km=new THREE.Mesh(new THREE.ConeGeometry(1.2,2.4,4,1),new THREE.MeshToonMaterial({color:'#FF5D73',gradientMap:gradTex}));km.scale.z=0.1;outline(km,0.05);kite.add(km);
   const tail=[];for(let i=0;i<5;i++){const b=at(box(0.25,0.1,0.02,['#FFD23F','#4D96FF'][i%2],{ol:false}),0,-1.4-i*0.4,0);kite.add(b);tail.push(b);}
   scene.add(kite);
   const lineG=new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]);const line=new THREE.Line(lineG,new THREE.LineBasicMaterial({color:0xffffff}));scene.add(line);
   F(kite,{k:'kite',n:'the red kite',c:['red'],s:'diamond-shaped',m:'paper',v:'soaring and loving it',snd:'flutter',u:'fly on a windy day',e:'🪁🌬️☁️',r:"I dance in the sky, but someone's always holding my string.",mv:true});
   W.movers.push(t=>{const hy=landH(-30,-40);kite.position.set(-30+Math.sin(t*0.5)*5,hy+15+Math.sin(t*1.1)*2,-44-Math.cos(t*0.35)*3);kite.rotation.z=Math.sin(t*0.8)*0.4;
     tail.forEach((b,i)=>{b.position.x=Math.sin(t*4-i)*0.2*i;});const p=lineG.attributes.position;p.setXYZ(0,-30.4,hy+2.2,-40);p.setXYZ(1,kite.position.x,kite.position.y-1,kite.position.z);p.needsUpdate=true;});}
}

