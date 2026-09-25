/* =========================================================
   Golden acorns and shells, scattered round the island for
   you to pick up whenever you like (between clues, on the way
   somewhere). Each is worth a couple of coins and counts
   towards the Squirrel tail. Everyone has their own.
   ========================================================= */
const Pickups={items:[],on:false,N:10,PAY:2,EVERY:10,BONUS:15};
const goldGlow=canvasTex(64,64,(x,W,H)=>{const g=x.createRadialGradient(W/2,H/2,2,W/2,H/2,W/2);g.addColorStop(0,'rgba(255,240,160,0.95)');g.addColorStop(0.35,'rgba(255,210,63,0.45)');g.addColorStop(1,'rgba(255,210,63,0)');x.fillStyle=g;x.fillRect(0,0,W,H);});
const goldMat=new THREE.MeshToonMaterial({color:'#FFC933',gradientMap:gradTex,emissive:'#7A5200'});
const goldDark=new THREE.MeshToonMaterial({color:'#D99A12',gradientMap:gradTex,emissive:'#5A3A00'});
function goldMesh(kind){
  const g=new THREE.Group(),spin=new THREE.Group();g.add(spin);
  if(kind==='acorn'){
    const nut=mk(new THREE.SphereGeometry(0.22,12,10),null,{mat:goldMat,w:0.025});nut.scale.set(1,1.25,1);nut.position.y=-0.04;spin.add(nut);
    spin.add(rot(at(cone(0.06,0.12,'#FFC933',6,{ol:false}),0,-0.34,0),Math.PI,0,0));
    const capM=mk(new THREE.SphereGeometry(0.25,12,8,0,TAU,0,Math.PI/2),null,{mat:goldDark,w:0.025});capM.scale.y=0.7;capM.position.y=0.1;spin.add(capM);
    const stem=cyl(0.03,0.04,0.12,'#D99A12',6,{ol:false});stem.material=goldDark;stem.position.y=0.3;spin.add(stem);
  }else{
    // a scallop shell: ribs fanning out from a hinge
    for(let i=0;i<7;i++){const a=(i/6-0.5)*1.9;const r=mk(new THREE.SphereGeometry(0.1,8,6),null,{mat:i%2?goldMat:goldDark,ol:false});r.scale.set(0.55,0.22,1.9);
      r.position.set(Math.sin(a)*0.17,Math.cos(a)*0.17,0);r.rotation.z=-a;r.rotation.x=Math.PI/2;spin.add(r);}
    const hinge=box(0.16,0.07,0.06,'#D99A12',{ol:false});hinge.material=goldDark;hinge.position.y=-0.02;spin.add(hinge);
    spin.position.y=-0.08;
  }
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:goldGlow,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));glow.scale.set(1.6,1.6,1);g.add(glow);
  g.traverse(m=>{m.raycast=()=>{};});
  g.userData={spin};return g;
}
// somewhere open, not too near you or another one
function goldSpot(){
  for(let i=0;i<80;i++){
    const x=sr(-62,125),z=sr(-62,62);
    if(edgeDist(x,z)<7.5||!spotClear(x,z,0.8))continue;
    if(P.bean&&Math.hypot(P.pos.x-x,P.pos.z-z)<14)continue;
    if(Pickups.items.some(it=>Math.hypot(it.x-x,it.z-z)<16))continue;
    return [x,z];
  }
  return null;
}
function goldSpawn(){
  const p=goldSpot();if(!p)return;const [x,z]=p,kind=edgeDist(x,z)<16?'shell':'acorn';
  const g=goldMesh(kind);g.position.set(x,landH(x,z)+0.55,z);scene.add(g);
  Pickups.items.push({g,x,z,kind,ph:Math.random()*TAU});
}
function goldTick(t,dt){
  if(!Pickups.on){Pickups.on=true;for(let i=0;i<Pickups.N;i++)goldSpawn();}
  for(let i=Pickups.items.length-1;i>=0;i--){
    const it=Pickups.items[i],y=landH(it.x,it.z)+0.55;
    it.g.userData.spin.rotation.y=t*2+it.ph;it.g.position.y=y+Math.sin(t*2.2+it.ph)*0.12;
    if(Math.hypot(P.pos.x-it.x,P.pos.z-it.z)<1.4&&Math.abs(P.pos.y-y)<2.2){
      scene.remove(it.g);Pickups.items.splice(i,1);goldGot(it);
      setTimeout(goldSpawn,15000+Math.random()*25000);
    }
  }
}
function goldGot(it){
  const n=Wallet.stats.gold+1;
  sfx.coin();buzz(20);burst(new V3(it.x,landH(it.x,it.z)+1,it.z),24);
  let pay=Pickups.PAY;if(n%Pickups.EVERY===0)pay+=Pickups.BONUS;
  Wallet.coins+=pay;coinPop('+'+pay);
  toast(`${it.kind==='acorn'?'🌰 Golden acorn':'🐚 Golden shell'}! (${n} collected)`+(n%Pickups.EVERY===0?String.fromCharCode(10)+`Bonus 🪙 ${Pickups.BONUS} for ${n}!`:''),1600);
  bumpStat('gold');
}
