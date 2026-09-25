/* =========================================================
   The countryside on the eastern headland: fields, a pond,
   an avenue of trees along Farm Lane, blossom rows by the
   orchard, and grass and wildflowers all over the island
   ========================================================= */
// many copies of one small mesh in a single draw: list of [x,y,z,turn,size]
function inst(geo,mat,list,shadow){
  const m=new THREE.InstancedMesh(geo,mat,list.length),d=new THREE.Object3D();
  list.forEach((p,i)=>{d.position.set(p[0],p[1],p[2]);d.rotation.set(0,p[3]||0,0);d.scale.setScalar(p[4]||1);d.updateMatrix();m.setMatrixAt(i,d.matrix);});
  m.castShadow=!!shadow;m.receiveShadow=true;m.frustumCulled=false;return m;   // copies spread far past the one mesh's own bounds
}
// a patch of field: tilled soil with rows of something growing on it (x0..x1 by z0..z1, rows run along x)
function field(x0,x1,z0,z1,soil,rowGap,plant,meta){
  const g=new THREE.Group(),cx=(x0+x1)/2,cz=(z0+z1)/2;
  const soilM=M(soil);
  for(let z=z0;z<=z1+1e-6;z+=rowGap){const L=x1-x0;const r=mk(new THREE.BoxGeometry(L,0.16,rowGap*0.55),soil,{mat:soilM,ol:false,shadow:false});
    r.position.set(0,landH(cx,z)+0.05,z-cz);g.add(r);}
  const list=[];
  for(let z=z0;z<=z1+1e-6;z+=rowGap)for(let x=x0+0.5;x<=x1-0.4;x+=plant.gap){const jx=x+sr(-0.15,0.15),jz=z+sr(-0.1,0.1);list.push([jx-cx,landH(jx,jz)+0.12,jz-cz,srand()*TAU,sr(0.85,1.15)]);}
  for(const [geo,mat,sh] of plant.parts)g.add(inst(geo,mat,list,sh));
  g.position.set(cx,0,cz);scene.add(g);F(g,meta);
  W.spots.push({x:cx,z:cz,r:Math.max(x1-x0,z1-z0)/2});
  return g;
}
// a round tree made of several leafy puffs (colours vary tree to tree)
const LEAVES=[['#5DBB55','#74CE62','#4AA548'],['#6CC05A','#86D96B','#58B04E'],['#4FAF6A','#66C47D','#3E9A5A'],['#8BC34A','#A2D65E','#76AE3C']];
function leafyTree(x,z,o){
  o=o||{};const g=new THREE.Group(),s=o.s||sr(0.85,1.15),c=o.cols||LEAVES[Math.floor(srand()*LEAVES.length)];
  g.add(at(cyl(0.2*s,0.32*s,2*s,'#8B5E3C',7),0,s,0));
  g.add(rot(at(cyl(0.07*s,0.1*s,0.9*s,'#8B5E3C',5,{ol:false}),0.35*s,1.7*s,0),0,0,-0.8));
  const puffs=[[0,2.85,0,1.25,0],[0.85,2.45,0.3,0.9,1],[-0.8,2.5,-0.25,0.92,2],[0.2,3.55,-0.2,0.85,1],[-0.3,2.3,0.75,0.75,2],[0.45,2.6,-0.8,0.78,0]];
  for(const [px,py,pz,r,ci] of puffs)g.add(at(sph(r*s,c[ci],9,7),px*s,py*s,pz*s));
  onGround(g,x,z);g.rotation.y=srand()*TAU;
  F(g,o.meta||{k:'tree',n:'a tree',c:['green'],s:'round',m:'wood',p:false});circ(x,z,0.5*s);return g;
}
// a tall skinny poplar, for lining the lane
function poplar(x,z){
  const g=new THREE.Group(),s=sr(0.9,1.1);
  g.add(at(cyl(0.15,0.22,1.4,'#8B5E3C',6),0,0.7,0));
  g.add(scl(at(sph(1,'#4FA84E',9,8),0,3.3*s,0),0.9,2.4*s,0.9));g.add(scl(at(sph(0.7,'#62BC5C',8,6),0.25,4.4*s,0.2),0.8,1.8,0.8));
  onGround(g,x,z);F(g,{k:'tree',n:'a tree',c:['green'],s:'tall',m:'wood',p:false});circ(x,z,0.4);return g;
}
function blossomTree(x,z,pink){
  return leafyTree(x,z,{s:sr(0.75,0.9),cols:pink?['#FFB3D1','#FFC8DF','#FF8FBF']:['#FFFFFF','#FDEFF4','#F7D9E6']});
}
function buildCountryside(){
  /* ---------- Farm Lane avenue ---------- */
  for(let x=62;x<=100;x+=7.5){for(const s of[-1,1]){const z=s*4.4+sr(-0.3,0.3);if(Math.abs(x-75)<2.5&&s>0)continue;if(Math.abs(x-72)<2.5&&s<0)continue;if(!blocked(x,z,0.5,true))poplar(x,z);}}

  /* ---------- fields ---------- */
  const stalk=new THREE.ConeGeometry(0.1,1.3,4);stalk.translate(0,0.65,0);
  const ear=new THREE.CapsuleGeometry(0.08,0.32,2,5);ear.translate(0,1.35,0);
  field(95,104,4,17,'#9C7650',0.9,{gap:0.55,parts:[[stalk,M('#D9B84A')],[ear,M('#F2D16B')]]},
    {k:'wheat field',n:'the wheat field',c:['gold'],s:'wide and flat',m:'wheat',v:'swaying in the breeze',snd:'swish',u:'bake bread from',e:'🌾🍞🌬️',
     r:['I’m rows and rows of golden stalks that end up as your bread.','Wind makes waves across me, but I’m not the sea.']});
  const stem=new THREE.CylinderGeometry(0.05,0.06,1.9,5);stem.translate(0,0.95,0);
  const leaf=new THREE.SphereGeometry(0.18,5,4);leaf.scale(1.6,0.3,0.8);leaf.translate(0.18,1,0);
  const petals=new THREE.CylinderGeometry(0.42,0.42,0.06,10);petals.rotateX(Math.PI/2);petals.translate(0,2,0.05);
  const face=new THREE.CylinderGeometry(0.22,0.22,0.1,10);face.rotateX(Math.PI/2);face.translate(0,2,0.1);
  field(67,90,34,39.5,'#8E6A48',1.4,{gap:1.05,parts:[[stem,M('#4E9E3E'),true],[leaf,M('#5DB24A')],[petals,M('#FFD23F'),true],[face,M('#7A4A22')]]},
    {k:'sunflower field',n:'the sunflower field',c:['yellow','green'],s:'tall',m:'flowers',v:'always facing the sun',snd:'buzz',u:'pick a giant flower from',e:'🌻☀️🐝',
     r:['We all turn our big yellow faces to follow the sun.','Our seeds end up as a snack for you and the birds.']});
  // hay stooks dotted over the stubble past the wheat
  {const g=new THREE.Group();for(const [x,z] of[[97,20.5],[100.5,22],[103,19.8]]){const s=grp(at(cone(0.55,1.2,'#E8C45A',7),0,0.6,0),at(cyl(0.58,0.58,0.12,'#D4AE45',7,{ol:false}),0,0.55,0));s.position.set(x-100,landH(x,z),z-21);g.add(s);}
   g.position.set(100,0,21);scene.add(g);F(g,{k:'haystack',n:'the haystacks',c:['yellow'],s:'pointy',m:'hay',v:'drying in the sun',u:'jump into',e:'🌾⛺☀️',r:['We’re little tents of dried grass standing in the field.']});
   W.spots.push({x:100,z:21,r:3.5});}

  /* ---------- the farm pond ---------- */
  {const cx=99.5,cz=28,R=3.4,g=new THREE.Group();const y=landH(cx,cz);
   const water=new THREE.Mesh(new THREE.CircleGeometry(R,28),new THREE.MeshToonMaterial({color:'#6ED3EC',gradientMap:gradTex}));water.rotation.x=-Math.PI/2;water.position.y=0.09;water.receiveShadow=true;g.add(water);
   for(let i=0;i<18;i++){const a=i/18*TAU;g.add(scl(at(sph(0.38,i%3?'#B8B2C8':'#CFC9DD',6,4,{w:0.03}),Math.cos(a)*R,0.1,Math.sin(a)*R),1.2,0.6,1));}
   for(const [px,pz,r] of[[-1,0.6,0.5],[1.1,-0.9,0.4],[0.2,1.6,0.35]]){const p=mk(new THREE.CylinderGeometry(r,r,0.03,10),'#5DB24A',{ol:false,shadow:false});p.position.set(px,0.12,pz);g.add(p);}
   g.add(at(sph(0.12,'#FF8FBF',6,5,{ol:false}),-1,0.2,0.6));
   for(let i=0;i<5;i++){const a=2.4+i*0.25;g.add(at(cyl(0.03,0.03,1.3,'#6B8E3A',4,{ol:false}),Math.cos(a)*(R+0.3),0.65,Math.sin(a)*(R+0.3)));g.add(at(cap(0.07,0.25,'#6B4226',{ol:false}),Math.cos(a)*(R+0.3),1.35,Math.sin(a)*(R+0.3)));}
   g.position.set(cx,y,cz);scene.add(g);
   F(g,{k:'pond',n:'the farm pond',c:['blue','green'],s:'round',m:'water',v:'still and peaceful',snd:'plop',u:'skim stones across',e:'🐸💧🪷',r:['Frogs sit on my lily pads and cows come to me for a drink.']});
   circ(cx,cz,R+0.2);}

  /* ---------- the hay wagon at the end of the lane ---------- */
  {const g=new THREE.Group();g.add(at(box(2.2,0.25,3.4,'#B5793A'),0,0.85,0));
   for(const s of[-1,1]){g.add(at(box(0.1,0.5,3.4,'#8B5E3C',{w:0.02}),1.1*s,1.2,0));for(const z of[-1.1,1.1])g.add(rot(at(cyl(0.55,0.55,0.14,'#8B5E3C',12),1.2*s,0.55,z),0,0,Math.PI/2));}
   g.add(at(box(1.9,0.9,2.9,'#E8C45A'),0,1.45,0));g.add(scl(at(sph(1,'#F2D16B',8,6),0,1.9,0),0.95,0.4,1.4));
   g.add(rot(at(cyl(0.05,0.05,1.8,'#8B5E3C',5,{ol:false}),0,0.7,2.4),Math.PI/2-0.25,0,0));
   place(g,108,1,1.9,{k:'hay wagon',n:'the hay wagon',c:['brown','yellow'],s:'boxy',m:'wood',v:'loaded to the top',snd:'creak',u:'take a bumpy hayride in',e:'🌾🛞🐴',
     r:['I’m piled high with dry grass and I roll on four wooden wheels.']},{exact:true,ry:Math.PI/2+0.2});}

  /* ---------- orchard blossom rows and the countryside trees ---------- */
  for(let x=64;x<=100;x+=5.2)for(let z=-9;z>=-31;z-=5.2){const px=x+sr(-0.6,0.6),pz=z+sr(-0.6,0.6);if(edgeDist(px,pz)<9.5||blocked(px,pz,1.4,true))continue;blossomTree(px,pz,srand()<0.4);}
  let n=0;for(let k=0;k<400&&n<22;k++){const a=sr(-0.75,0.8),r=sr(62,112),x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(x<60||edgeDist(x,z)<10||blocked(x,z,1.6,true))continue;
    if(x<94&&z>-6&&z<12)continue;   // keep the view from the lane to the farm gate and the orchard gate open
    leafyTree(x,z);n++;}
}

/* ---------- grass tufts and wildflowers over every lawn ---------- */
function buildGrass(){
  const blades=[];for(const [a,l,h] of[[0,0.12,0.55],[2.1,0.1,0.45],[4.2,0.14,0.5],[1,0.02,0.38]]){const b=new THREE.ConeGeometry(0.05,h,3,1,true);b.translate(0,h/2,0);b.rotateZ(l*(a>3?-1:1));b.rotateY(a);b.translate(Math.cos(a)*0.06,0,Math.sin(a)*0.06);blades.push(b);}
  const tuft=mergeGeos(blades.map(b=>b.toNonIndexed()));
  const lawn=(x,z)=>edgeDist(x,z)>12.5&&!onRoad(x,z)&&Math.hypot(x,z)>16.5&&!(x>9&&x<58&&Math.abs(z)<7)&&!blocked(x,z,0.15,false);
  const n=GFX.lvl==='low'?2000:5500,tufts=[],flowers=[];
  for(let k=0;k<n*3&&tufts.length<n;k++){const x=sr(-60,112),z=sr(-66,66);if(!lawn(x,z))continue;tufts.push([x,landH(x,z)-0.02,z,srand()*TAU,sr(0.5,1.05)]);}
  for(let k=0;k<n&&flowers.length<n/8;k++){const x=sr(-60,112),z=sr(-66,66);if(!lawn(x,z))continue;flowers.push([x,landH(x,z)+0.28,z,0,sr(0.8,1.2)]);}
  const gm=new THREE.MeshToonMaterial({color:'#FFFFFF',gradientMap:gradTex,side:THREE.DoubleSide});
  const g=inst(tuft,gm,tufts,false);
  const shades=['#5DB24A','#6CC05A','#7ED957','#4FA548','#8BCF5E'].map(c=>new THREE.Color(c));
  tufts.forEach((_,i)=>g.setColorAt(i,shades[i%shades.length]));g.instanceColor.needsUpdate=true;
  g.raycast=()=>{};scene.add(g);W.grass=g;
  const head=new THREE.IcosahedronGeometry(0.11,0);
  const f=inst(head,new THREE.MeshToonMaterial({color:'#FFFFFF',gradientMap:gradTex}),flowers,false);
  const pet=['#FFFFFF','#FFD23F','#FF8FBF','#B39DFF','#FF6F61','#FFFFFF'].map(c=>new THREE.Color(c));
  flowers.forEach((_,i)=>f.setColorAt(i,pet[i%pet.length]));f.instanceColor.needsUpdate=true;
  f.raycast=()=>{};scene.add(f);
  const st=new THREE.CylinderGeometry(0.012,0.012,0.28,3);st.translate(0,-0.14,0);
  const s=inst(st,M('#4E9E3E'),flowers,false);s.raycast=()=>{};scene.add(s);
}
