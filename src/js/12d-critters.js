/* =========================================================
   Critters that notice you: seagulls on the pier that take
   off when you come close, free-range chickens that scatter,
   a cat who runs off, rabbits in the meadow, butterflies in
   the park, and a puppy who follows you around for a while.
   They're just for fun, so none of them are clue answers.
   ========================================================= */
// is (x,z) open ground, at least c away from anything solid?
function spotClear(x,z,c){
  if(!walkable(x,z)||onDock(x,z)||Math.hypot(x-POND.x,z-POND.z)<POND.r+1)return false;
  for(const o of W.obstacles){
    if(o.t===0){if(Math.hypot(x-o.x,z-o.z)<o.r+c)return false;}
    else if(x>o.x0-c&&x<o.x1+c&&z>o.z0-c&&z<o.z1+c)return false;
  }
  return true;
}
function lineClear(x0,z0,x1,z1,c){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,z1-z0)/0.7));for(let i=1;i<=n;i++)if(!spotClear(lerp(x0,x1,i/n),lerp(z0,z1,i/n),c))return false;return true;}
// the nearest bean (you or a friend) to (x,z)
function nearestBean(x,z){
  let best=null,d=Infinity;
  if(P.bean&&myCode){d=Math.hypot(P.pos.x-x,P.pos.z-z);best=P.pos;}
  for(const r of Remote.values()){const p=r.bean.position,e=Math.hypot(p.x-x,p.z-z);if(e<d){d=e;best=p;}}
  return {p:best,d};
}
// sounds from critters get quieter with distance, and stop past 18 m
const nearYou=(x,z)=>P.bean&&myCode?clamp(1-Math.hypot(P.pos.x-x,P.pos.z-z)/18,0,1):0;

/* ---------- a ground critter that wanders round home and runs from beans ----------
   o: {home:[x,z], r (roam radius), walk, run (speeds), scare (how close is too close),
       c (clearance), idle:[min,max] pause, anim(t,state), noise()} */
function roamer(g,o){
  const s={x:o.home[0],z:o.home[1],tx:o.home[0],tz:o.home[1],wait:Math.random()*3,flee:0,face:Math.random()*TAU,moving:false};
  // start somewhere open near home
  for(let i=0;i<30;i++){const a=Math.random()*TAU,d=Math.random()*o.r,x=o.home[0]+Math.cos(a)*d,z=o.home[1]+Math.sin(a)*d;if(spotClear(x,z,o.c)){s.x=s.tx=x;s.z=s.tz=z;break;}}
  scene.add(g);
  const pickTarget=(ax,az,dist,spread)=>{
    const base=Math.atan2(az,ax);
    for(const off of[0,0.5,-0.5,1,-1,1.6,-1.6,2.3,-2.3,Math.PI]){
      const a=base+off*(spread||1),x=s.x+Math.cos(a)*dist,z=s.z+Math.sin(a)*dist;
      if(Math.hypot(x-o.home[0],z-o.home[1])>o.r*1.6)continue;
      if(lineClear(s.x,s.z,x,z,o.c))return [x,z];
    }
    return null;
  };
  W.movers.push((t,dt)=>{
    const nb=nearestBean(s.x,s.z);
    if(nb.p&&nb.d<o.scare&&s.flee<=0){
      const tg=pickTarget(s.x-nb.p.x,s.z-nb.p.z,o.run*0.9,1);
      if(tg){s.tx=tg[0];s.tz=tg[1];s.flee=1.1;s.wait=0.4+Math.random();if(o.noise&&Math.random()<0.7){const v=nearYou(s.x,s.z);if(v>0.05)o.noise(v);}}
    }
    s.flee-=dt;
    const dx=s.tx-s.x,dz=s.tz-s.z,d=Math.hypot(dx,dz);
    s.moving=d>0.15;
    if(s.moving){const sp=Math.min(d,(s.flee>0?o.run:o.walk)*dt);s.x+=dx/d*sp;s.z+=dz/d*sp;s.face=angLerp(s.face,Math.atan2(dx,dz),damp(s.flee>0?14:6,dt));}
    else{s.wait-=dt;if(s.wait<=0){s.wait=o.idle[0]+Math.random()*(o.idle[1]-o.idle[0]);
      const a=Math.random()*TAU,back=Math.hypot(s.x-o.home[0],s.z-o.home[1])>o.r;
      const tg=back?pickTarget(o.home[0]-s.x,o.home[1]-s.z,Math.min(4,Math.hypot(o.home[0]-s.x,o.home[1]-s.z)),0.6):pickTarget(Math.cos(a),Math.sin(a),1+Math.random()*3,1);
      if(tg){s.tx=tg[0];s.tz=tg[1];}}}
    g.position.set(s.x,landH(s.x,s.z),s.z);g.rotation.y=s.face;
    o.anim(t,s,dt);
  });
  return s;
}

/* ---------- meshes ---------- */
function chickenMesh(c){
  const g=new THREE.Group(),b=new THREE.Group();g.add(b);
  b.add(scl(at(sph(0.22,c,8,6,{w:0.02}),0,0.3,0),0.9,0.9,1.2));
  const head=new THREE.Group();head.position.set(0,0.52,0.16);b.add(head);
  head.add(sph(0.13,c,8,6,{w:0.018}));head.add(rot(at(cone(0.035,0.09,'#F2A541',4,{ol:false}),0,0,0.15),Math.PI/2,0,0));
  head.add(at(scl(sph(0.05,'#E8323F',4,3,{ol:false}),0.6,1,1.4),0,0.13,0));head.add(at(scl(sph(0.03,'#E8323F',4,3,{ol:false}),0.6,1,1),0,-0.09,0.1));
  for(const s of[-1,1])head.add(at(sph(0.022,'#1D1533',4,3,{ol:false}),0.08*s,0.03,0.08));
  b.add(rot(at(cone(0.1,0.18,c,5,{ol:false}),0,0.42,-0.26),-0.9,0,0));
  const wings=[];for(const s of[-1,1]){const w=new THREE.Group();w.position.set(0.18*s,0.36,0);const m=scl(sph(0.13,c,6,5,{ol:false}),0.35,0.8,1.2);m.position.set(0.02*s,-0.04,0);w.add(m);b.add(w);wings.push(w);}
  for(const s of[-1,1])g.add(at(cyl(0.02,0.02,0.16,'#F2A541',4,{ol:false}),0.07*s,0.08,0));
  g.userData={b,head,wings};return g;
}
function rabbitMesh(){
  const g=new THREE.Group(),b=new THREE.Group();g.add(b);const c='#D8C4AE';
  b.add(scl(at(sph(0.25,c,10,8,{w:0.02}),0,0.24,0),0.9,0.85,1.2));
  b.add(at(sph(0.16,c,8,6,{w:0.02}),0,0.42,0.22));
  for(const s of[-1,1]){b.add(rot(at(cap(0.045,0.22,c,{w:0.012}),0.07*s,0.66,0.18),-0.2,0,0.15*s));b.add(at(sph(0.025,'#1D1533',4,3,{ol:false}),0.1*s,0.46,0.34));}
  b.add(at(sph(0.025,'#FF8FA8',4,3,{ol:false}),0,0.41,0.38));b.add(at(sph(0.08,'#FFFFFF',6,5,{ol:false}),0,0.28,-0.3));
  g.userData={b};return g;
}
function puppyMesh(){
  const g=new THREE.Group(),b=new THREE.Group();g.add(b);const c='#E8B878',d='#8B5E3C';
  b.add(scl(at(sph(0.28,c,10,8,{w:0.02}),0,0.42,0),0.85,0.8,1.35));
  const head=new THREE.Group();head.position.set(0,0.72,0.34);b.add(head);
  head.add(sph(0.22,c,10,8,{w:0.02}));head.add(at(scl(sph(0.11,'#FFF3DC',8,6,{ol:false}),1,0.8,1),0,-0.06,0.17));head.add(at(sph(0.045,'#1D1533',6,5,{ol:false}),0,-0.02,0.27));
  for(const s of[-1,1]){head.add(at(sph(0.03,'#1D1533',4,3,{ol:false}),0.09*s,0.06,0.18));head.add(rot(at(scl(sph(0.1,d,6,5,{ol:false}),0.5,1.3,0.9),0.19*s,-0.02,-0.02),0,0,0.35*s));}
  const tongue=at(scl(sph(0.04,'#FF8FA8',4,3,{ol:false}),1,0.5,1.4),0,-0.12,0.24);head.add(tongue);
  const tail=new THREE.Group();tail.position.set(0,0.56,-0.34);b.add(tail);tail.add(rot(at(cap(0.04,0.18,c,{w:0.012}),0,0.12,0),-0.4,0,0));
  const legs=[];for(const [x,z] of[[-0.13,0.2],[0.13,0.2],[-0.13,-0.2],[0.13,-0.2]]){const p=new THREE.Group();p.position.set(x,0.3,z);p.add(at(cyl(0.06,0.06,0.3,c,6,{ol:false}),0,-0.15,0));g.add(p);legs.push(p);}
  g.userData={b,head,tail,legs,tongue};return g;
}
function gullMesh(){
  const g=new THREE.Group();
  g.add(scl(at(sph(0.22,'#FFFFFF',8,6,{w:0.02}),0,0.32,0),0.8,0.8,1.5));g.add(at(sph(0.14,'#FFFFFF',8,6,{w:0.015}),0,0.48,0.26));
  g.add(rot(at(cone(0.04,0.14,'#FF9F1C',5,{ol:false}),0,0.46,0.42),Math.PI/2,0,0));
  for(const s of[-1,1])g.add(at(sph(0.02,'#1D1533',4,3,{ol:false}),0.07*s,0.51,0.34));
  g.add(rot(at(cone(0.1,0.2,'#C8D4E0',4,{ol:false}),0,0.32,-0.36),-Math.PI/2,0,0));
  const wings=[];for(const s of[-1,1]){const w=new THREE.Group();w.position.set(0.14*s,0.38,0);const m=box(0.62,0.03,0.24,'#E8EEF6',{ol:false});m.position.x=0.31*s;w.add(m);
    const tip=box(0.2,0.031,0.18,'#2B2040',{ol:false});tip.position.x=0.56*s;w.add(tip);g.add(w);wings.push([w,s]);}
  for(const s of[-1,1])g.add(at(cyl(0.015,0.015,0.14,'#FF9F1C',4,{ol:false}),0.06*s,0.07,0));
  g.userData={wings};return g;
}

function buildCritters(){
  /* chickens: free range round the farmyard; they scatter, flapping, when you come close */
  const CHK=[['#FFFFFF'],['#C8793C'],['#E8C45A'],['#FFFFFF'],['#2B2040']];
  CHK.forEach(([c],i)=>{
    const g=chickenMesh(c),u=g.userData;
    roamer(g,{home:[70+i*2.2,5.5+(i%2)*2],r:6,walk:0.8,run:5,scare:3.2,c:0.5,idle:[0.6,2.5],noise:v=>sfx.cluck(v),
      anim(t,s){const peck=!s.moving&&Math.sin(t*2+i*1.7)>0.3;u.head.position.z=0.16+(peck?0.08:0);u.head.position.y=0.52-(peck?0.18+Math.max(0,Math.sin(t*14))*0.05:0);
        const run=s.flee>0&&s.moving;u.b.position.y=s.moving?Math.abs(Math.sin(t*(run?22:10)))*(run?0.12:0.04):0;
        u.wings.forEach((w,k)=>{w.rotation.z=(k?-1:1)*(run?0.4+Math.sin(t*40)*0.6:0);});}});
  });

  /* the town cat: naps and wanders round the square and Market Street, and darts off if you rush it */
  {const g=catMesh('#8C8C9E'),tail=g.userData.tail;
   roamer(g,{home:[20,-6],r:16,walk:1.1,run:7.5,scare:3.8,c:0.6,idle:[2,6],noise:v=>sfx.meow(v),
     anim(t,s){tail.rotation.x=-0.7+(s.flee>0?-0.6:Math.sin(t*1.5)*0.15);tail.rotation.z=Math.sin(t*2.2)*0.25;g.position.y+=s.moving?Math.abs(Math.sin(t*(s.flee>0?18:8)))*0.05:0;}});}

  /* rabbits in the meadows out east: a hop at a time */
  for(const [x,z] of[[106,-22],[112,6],[96,34]]){
    const g=rabbitMesh(),u=g.userData;
    roamer(g,{home:[x,z],r:7,walk:1.4,run:6.5,scare:5,c:0.5,idle:[1,4],
      anim(t,s){const f=s.flee>0?12:7;u.b.position.y=s.moving?Math.abs(Math.sin(t*f))*(s.flee>0?0.45:0.2):0;u.b.rotation.x=s.moving?-Math.cos(t*f)*0.2:0;}});
  }

  /* seagulls: perched along the pier; they take off, circle the harbor and land again */
  {const perches=[[1.2,52],[-1.2,56.5],[1.2,61],[-1.2,65.5],[4.5,71.5],[-4.8,71.5],[1.2,68]];
   const taken=new Set();
   for(let i=0;i<4;i++){
     const g=gullMesh(),u=g.userData;scene.add(g);
     let pi=i*2%perches.length;taken.add(pi);
     const s={mode:'sit',t:0,x:perches[pi][0],z:perches[pi][1],y:0,a:Math.random()*TAU,face:Math.random()*TAU,sx:0,sz:0,sy:0};
     s.y=groundY(s.x,s.z);
     W.movers.push((t,dt)=>{
       if(s.mode==='sit'){
         const nb=nearestBean(s.x,s.z);
         if(nb.p&&nb.d<5.5){s.mode='fly';s.t=5+Math.random()*5;s.a=Math.atan2(s.z-58,s.x-2);taken.delete(pi);const v=nearYou(s.x,s.z);if(v>0.05)sfx.gull(v);}
         g.position.set(s.x,s.y,s.z);g.rotation.set(0,s.face+Math.sin(t*0.4+i)*0.3,0);
         u.wings.forEach(([w,k])=>{w.rotation.z=k*-0.1;w.rotation.y=k*1.2;});
       }else if(s.mode==='fly'){
         s.t-=dt;s.a+=dt*0.5;const r=10+i*1.5,tx=2+Math.cos(s.a)*r,tz=58+Math.sin(s.a)*r,ty=8+i*0.8+Math.sin(t*0.8+i);
         const k=damp(1.6,dt);s.x=lerp(s.x,tx,k);s.z=lerp(s.z,tz,k);s.y=lerp(s.y,ty,k);
         g.position.set(s.x,s.y,s.z);g.rotation.set(0,-s.a,0.35);
         const f=Math.sin(t*9+i)*0.7;u.wings.forEach(([w,k2])=>{w.rotation.y=0;w.rotation.z=k2*f;});
         if(s.t<=0){let n=Math.floor(Math.random()*perches.length);for(let j=0;j<perches.length&&taken.has(n);j++)n=(n+1)%perches.length;
           pi=n;taken.add(n);s.mode='land';s.sx=perches[n][0];s.sz=perches[n][1];s.sy=groundY(s.sx,s.sz);}
       }else{
         const dx=s.sx-s.x,dz=s.sz-s.z,dy=s.sy-s.y,d=Math.hypot(dx,dz,dy),sp=Math.min(d,7*dt);
         if(d<0.05){s.mode='sit';s.x=s.sx;s.z=s.sz;s.y=s.sy;s.face=Math.random()*TAU;}
         else{s.x+=dx/d*sp;s.z+=dz/d*sp;s.y+=dy/d*sp;g.rotation.set(0,Math.atan2(dx,dz),0);}
         g.position.set(s.x,s.y,s.z);const f=Math.sin(t*12)*0.6;u.wings.forEach(([w,k2])=>{w.rotation.y=0;w.rotation.z=k2*f;});
       }
     });
   }}

  /* butterflies in the park and by the flower beds: they flutter off if you get too close */
  {const cols=['#FF8FBF','#FFD23F','#9B5DE5','#4D96FF','#FF9F1C','#3DDC97'];
   const homes=[[-30,14],[-33,-4],[-46,2],[-24,6],[38,6],[16,-8]];
   homes.forEach(([hx,hz],i)=>{
     const g=new THREE.Group(),wm=new THREE.MeshBasicMaterial({color:cols[i%cols.length],side:THREE.DoubleSide});
     const wings=[];for(const s of[-1,1]){const piv=new THREE.Group();const w=new THREE.Mesh(new THREE.CircleGeometry(0.16,8),wm);w.scale.set(1,1.3,1);w.position.x=0.15*s;w.rotation.x=-Math.PI/2;piv.add(w);
       const w2=new THREE.Mesh(new THREE.CircleGeometry(0.1,8),wm);w2.position.set(0.1*s,0,-0.14);w2.rotation.x=-Math.PI/2;piv.add(w2);g.add(piv);wings.push([piv,s]);}
     g.add(scl(at(new THREE.Mesh(new THREE.SphereGeometry(0.03,5,4),M('#2B2040')),0,0,0),1,1,4));scene.add(g);
     const s={x:hx,z:hz,scat:0,ox:0,oz:0};
     W.movers.push((t,dt)=>{
       const nb=nearestBean(s.x,s.z);if(nb.p&&nb.d<2.5&&s.scat<=0){s.scat=3;const a=Math.atan2(s.z-nb.p.z,s.x-nb.p.x);s.ox=Math.cos(a)*3;s.oz=Math.sin(a)*3;}
       s.scat-=dt;const k=clamp(s.scat/3,0,1);
       const a=t*0.7+i*1.3,x=hx+Math.cos(a)*2.2+Math.sin(t*1.9+i)*0.7+s.ox*k,z=hz+Math.sin(a*1.2)*2.2+s.oz*k;s.x=x;s.z=z;
       g.position.set(x,landH(x,z)+1+Math.sin(t*2.3+i)*0.4+k*2.5,z);g.rotation.y=-a;
       const f=Math.sin(t*(k>0?30:18)+i)*1.1;wings.forEach(([p,sg])=>{p.rotation.z=sg*f;});
     });
   });}

  /* the puppy: waits in the park; walk up to it and it tags along behind you for a while */
  {const g=puppyMesh(),u=g.userData;scene.add(g);
   const HOME=[-32,0];
   const s={x:HOME[0],z:HOME[1],face:0,follow:false,bored:0,barkT:3,sp:0,told:false};
   const pos={x:s.x,z:s.z};
   W.movers.push((t,dt)=>{
     let tx=HOME[0],tz=HOME[1],want=1.2;
     if(P.bean&&myCode){
       const d=Math.hypot(P.pos.x-s.x,P.pos.z-s.z);
       if(!s.follow&&d<3.5){s.follow=true;s.bored=90+Math.random()*60;if(!s.told){s.told=true;sys('🐶 A puppy is following you! It’ll head home when it gets tired.');}sfx.bark(1);}
       if(s.follow){s.bored-=dt;if(s.bored<=0||d>45){s.follow=false;sys('🐶 The puppy trotted back to the park.');}}
       if(s.follow){const bx=P.pos.x-Math.sin(P.face)*2.2,bz=P.pos.z-Math.cos(P.face)*2.2;tx=bx;tz=bz;want=Math.min(16,Math.max(3,Math.hypot(P.vel.x,P.vel.z)+1.5));}
     }else s.follow=false;
     const dx=tx-s.x,dz=tz-s.z,d=Math.hypot(dx,dz),moving=d>(s.follow?0.8:0.3);
     s.sp=lerp(s.sp,moving?Math.min(want*(d>6?1.3:1),d*3):0,damp(6,dt));
     if(s.sp>0.05&&d>0.01){const nx=s.x+dx/d*s.sp*dt,nz=s.z+dz/d*s.sp*dt;
       pos.x=nx;pos.z=nz;collide(pos);
       if(walkable(pos.x,pos.z)){s.x=pos.x;s.z=pos.z;}
       s.face=angLerp(s.face,Math.atan2(dx,dz),damp(10,dt));}
     else if(s.follow&&P.bean)s.face=angLerp(s.face,Math.atan2(P.pos.x-s.x,P.pos.z-s.z),damp(4,dt));
     g.position.set(s.x,groundY(s.x,s.z),s.z);g.rotation.y=s.face;
     const run=s.sp>0.3,f=Math.min(18,6+s.sp*1.6);
     u.legs.forEach((l,i)=>{l.rotation.x=run?Math.sin(t*f+(i===0||i===3?0:Math.PI))*0.7:0;});
     u.b.position.y=run?Math.abs(Math.sin(t*f))*0.06:0;
     u.tail.rotation.z=Math.sin(t*(s.follow?20:6))*0.6;
     u.head.rotation.x=run?0:Math.sin(t*1.2)*0.1;u.tongue.visible=run||s.follow;
     s.barkT-=dt;if(s.barkT<=0){s.barkT=6+Math.random()*10;if(s.follow||Math.random()<0.3){const v=nearYou(s.x,s.z);if(v>0.05)sfx.bark(v);}}
   });}
}
