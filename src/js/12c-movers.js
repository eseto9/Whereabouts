/* =========================================================
   More things on the move: a combine in the wheat, a pony on
   Farm Lane, a jogger round the square, an ice cream truck on
   the ring road, a dragonfly over the farm pond and a kid on
   a scooter up to the windmill
   ========================================================= */
// walk a closed loop of [x,z] points at a steady speed; returns {x,z,dx,dz}
function loopWalk(pts){
  const segs=[];let total=0;
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push({a,b,L,s:total});total+=L;}
  return d=>{d=((d%total)+total)%total;for(const g of segs)if(d<=g.s+g.L){const f=(d-g.s)/g.L;return {x:lerp(g.a[0],g.b[0],f),z:lerp(g.a[1],g.b[1],f),dx:g.b[0]-g.a[0],dz:g.b[1]-g.a[1]};}
    const g=segs[0];return {x:g.a[0],z:g.a[1],dx:g.b[0]-g.a[0],dz:g.b[1]-g.a[1]};};
}
function buildMovers(){
  // combine harvester working round the wheat field
  {const g=new THREE.Group();
   g.add(at(box(2,1.5,3,'#E8B820'),0,1.35,0));g.add(at(box(1.4,1.1,1.2,'#E8B820'),0,2.5,-0.6));g.add(at(box(1.3,0.7,1.1,'#BFE9FF',{ol:false}),0,2.55,-0.05));
   g.add(at(box(3,0.5,0.9,'#C9361F'),0,0.6,2.05));
   const reel=new THREE.Group();reel.position.set(0,0.95,2.3);for(let i=0;i<5;i++){const b=box(2.8,0.08,0.08,'#2B2040',{ol:false});b.position.set(0,Math.cos(i/5*TAU)*0.35,Math.sin(i/5*TAU)*0.35);reel.add(b);}g.add(reel);
   const wheels=[];for(const s of[-1,1]){const w=rot(at(cyl(0.65,0.65,0.4,'#2B2040',12),1.1*s,0.65,0.5),0,0,Math.PI/2);g.add(w);wheels.push(w);g.add(rot(at(cyl(0.4,0.4,0.3,'#2B2040',10),1.05*s,0.4,-1.2),0,0,Math.PI/2));}
   g.add(rot(at(cyl(0.15,0.15,1.8,'#E8B820',6),1.1,2.3,-0.6),0,0,-0.9));
   scene.add(g);
   F(g,{k:'combine harvester',n:'the combine harvester',c:['yellow','red'],s:'big and boxy',m:'metal',v:'hungry for wheat',snd:'rumble-chop',u:'harvest a whole field with',e:'🌾🚜✂️',
     r:['I munch through fields of wheat and spit out the straw.','My spinning reel pulls the golden stalks into my mouth.'],mv:true});
   const path=loopWalk([[93.5,3],[105.5,3],[105.5,18.5],[93.5,18.5]]);
   W.movers.push(t=>{const p=path(t*1.6);g.position.set(p.x,landH(p.x,p.z),p.z);g.rotation.y=angLerp(g.rotation.y,Math.atan2(p.dx,p.dz),0.08);reel.rotation.x=-t*3;wheels.forEach(w=>w.rotation.x=t*2);});}
  // a pony plodding up and down Farm Lane
  {const g=new THREE.Group();const c='#B5793A',d='#5B3A29';
   g.add(scl(at(sph(0.5,c,10,8),0,1.05,0),0.8,0.8,1.5));
   const neck=rot(at(cyl(0.18,0.24,0.8,c,8),0,1.5,0.62),0.6,0,0);g.add(neck);
   const head=grp(scl(at(sph(0.26,c,8,6),0,0,0),0.8,0.8,1.3),at(sph(0.035,'#1D1533',4,3,{ol:false,shadow:false}),0.13,0.06,0.12),at(sph(0.035,'#1D1533',4,3,{ol:false,shadow:false}),-0.13,0.06,0.12));
   for(const s of[-1,1])head.add(rot(at(cone(0.06,0.18,c,4,{ol:false}),0.1*s,0.24,-0.05),0,0,-0.2*s));head.position.set(0,1.85,0.9);g.add(head);
   g.add(rot(at(box(0.08,0.5,0.7,d,{ol:false}),0,1.72,0.45),0.6,0,0));g.add(rot(at(cyl(0.05,0.12,0.7,d,6),0,1.0,-0.8),-0.5,0,0));
   const legs=[];for(const [x,z] of[[-0.22,0.45],[0.22,0.45],[-0.22,-0.45],[0.22,-0.45]]){const p=new THREE.Group();p.position.set(x,0.85,z);p.add(at(cyl(0.08,0.07,0.8,c,6,{w:0.02}),0,-0.4,0));p.add(at(cyl(0.09,0.09,0.1,d,6,{ol:false}),0,-0.8,0));g.add(p);legs.push(p);}
   scene.add(g);
   F(g,{k:'pony',n:'the pony',c:['brown'],s:'four-legged',m:'fur',v:'plodding happily',snd:'clip-clop',u:'give a sugar lump to',e:'🐴🥕🌾',
     r:['I clip-clop along the lane on four hooves, swishing my tail.'],mv:true});
   W.movers.push(t=>{const u=(t*0.05)%2,f=u<1?u:2-u,x=lerp(62,101,smooth(0,1,f)),z=-1.1;g.position.set(x,landH(x,z),z);g.rotation.y=u<1?Math.PI/2:-Math.PI/2;
     legs.forEach((l,i)=>{l.rotation.x=Math.sin(t*7+(i%2?Math.PI:0)+(i>1?Math.PI/2:0))*0.45;});head.rotation.x=Math.sin(t*3.5)*0.08;});}
  // a jogger doing laps of the square
  {const m=npc('#FF3B5C','#FFFFFF');m.add(at(box(0.5,0.12,0.06,'#FFFFFF',{ol:false}),0,1.72,0.25));scene.add(m);
   F(m,{k:'jogger',n:'the jogger',c:['red','white'],s:'tall',m:'sportswear',v:'puffing but proud',snd:'huff-puff',u:'race around the square',e:'🏃💨👟',
     r:['I run round and round the square and never get anywhere.'],mv:true});
   W.movers.push(t=>{const a=t*0.3,r=17.3,x=Math.cos(a)*r,z=Math.sin(a)*r;m.position.set(x,landH(x,z)+Math.abs(Math.sin(t*10))*0.12,z);m.rotation.y=Math.atan2(-Math.sin(a),Math.cos(a));
     m.userData.arms[0].rotation.x=Math.sin(t*10)*0.9;m.userData.arms[1].rotation.x=-Math.sin(t*10)*0.9;});}
  // ice cream truck, following the delivery van round the ring road, half a lap behind
  {const g=new THREE.Group();
   g.add(at(box(1.9,1.9,3.6,'#FFE6F2'),0,1.3,-0.2));g.add(at(box(1.9,1.1,1.1,'#FF8FBF'),0,0.9,2.1));g.add(at(box(1.6,0.5,0.1,'#BFE9FF',{ol:false}),0,1.3,2.65));
   g.add(at(box(0.08,0.8,1.8,'#2B2040',{ol:false}),0.96,1.5,-0.3));g.add(at(box(0.3,0.1,1.9,'#FF8FBF',{ol:false}),1.05,1.05,-0.3));
   const cone_=grp(rot(at(cone(0.35,0.9,'#E8B26A',8),0,0,0),Math.PI,0,0),at(sph(0.4,'#FFB3D1',10,8),0,0.55,0),at(sph(0.16,'#FF3B5C',6,5,{ol:false}),0,0.95,0));cone_.position.set(0,2.75,-0.4);g.add(cone_);   // the big cone on the roof
   const wheels=[];for(const x of[-0.9,0.9])for(const z of[-1.3,1.7]){const w=rot(at(cyl(0.38,0.38,0.3,'#2B2040',10),x,0.38,z),0,0,Math.PI/2);g.add(w);wheels.push(w);}
   scene.add(g);
   F(g,{k:'ice cream truck',n:'the ice cream truck',c:['pink','white'],s:'boxy',m:'metal',v:'always ringing its jingle',snd:'ding-a-ling',u:'buy a cold treat from',e:'🍦🚚🎶',
     r:['I drive round playing a tune, and children come running.'],mv:true});
   W.movers.push(t=>{const a=t*0.16+Math.PI,x=Math.cos(a)*24.8,z=Math.sin(a)*24.8;g.position.set(x,landH(x,z)+0.1,z);g.rotation.y=Math.atan2(-Math.sin(a),Math.cos(a));wheels.forEach(w=>w.rotation.x=t*6);});}
  // dragonfly darting over the farm pond
  {const g=new THREE.Group();g.add(scl(at(sph(0.06,'#3DDCC4',6,5,{w:0.01}),0,0,0),1,1,5));g.add(at(sph(0.07,'#2EA897',6,5,{ol:false}),0,0,0.32));
   const wings=[];for(const s of[-1,1])for(const z of[0.12,-0.02]){const w=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.1),new THREE.MeshBasicMaterial({color:'#DDF8FF',transparent:true,opacity:0.7,side:THREE.DoubleSide}));w.rotation.x=-Math.PI/2;w.position.set(0.22*s,0.04,z);g.add(w);wings.push(w);}
   scene.add(g);
   F(g,{k:'dragonfly',n:'the dragonfly',c:['turquoise'],s:'long and skinny',m:'wings',v:'zippy',snd:'bzzz',u:'watch zip over the water',e:'🪰💧✨',
     r:['I have four see-through wings and I zip over ponds.'],mv:true});
   W.movers.push(t=>{const a=t*0.9;g.position.set(99.5+Math.cos(a)*2+Math.sin(t*2.3)*0.6,landH(99.5,28)+0.9+Math.sin(t*3)*0.25,28+Math.sin(a*1.3)*1.8);g.rotation.y=-a+Math.sin(t*4)*0.4;wings.forEach((w,i)=>{w.rotation.z=Math.sin(t*60+i)*0.4;});});}
  // kid on a scooter, up and down the path to the windmill
  {const g=new THREE.Group();const kid=npc('#4D96FF','#FFD23F');kid.scale.setScalar(0.72);kid.position.set(0,0.2,0);g.add(kid);
   g.add(at(box(0.25,0.06,1,'#FF5D73',{w:0.015}),0,0.12,0));g.add(rot(at(cyl(0.03,0.03,1.1,'#8FA3B8',5,{ol:false}),0,0.7,0.45),-0.15,0,0));g.add(at(box(0.5,0.05,0.05,'#2B2040',{ol:false}),0,1.22,0.53));
   for(const z of[-0.42,0.42])g.add(rot(at(cyl(0.1,0.1,0.06,'#2B2040',8,{ol:false}),0,0.1,z),0,0,Math.PI/2));
   scene.add(g);
   F(g,{k:'scooter',n:'the kid on a scooter',c:['blue','red'],s:'small',m:'metal',v:'whizzing about',snd:'whirr',u:'race along the path',e:'🛴🧒💨',
     r:['I push along with one foot and glide down the path.'],mv:true});
   const path=loopWalk([[25.5,-14.4],[31,-16.2],[37,-18.6],[41.2,-19.8],[41.5,-22.4],[35,-23.4],[30.5,-25.6],[27.4,-29.4],[30.5,-25.6],[35,-23.4],[41.5,-22.4],[41.2,-19.8],[37,-18.6],[31,-16.2]]);
   W.movers.push(t=>{const p=path(t*2.4);g.position.set(p.x,landH(p.x,p.z)+0.06,p.z);g.rotation.y=angLerp(g.rotation.y,Math.atan2(p.dx,p.dz),0.2);kid.userData.arms[0].rotation.x=-0.9;kid.userData.arms[1].rotation.x=-0.9;});}
}
