/* =========================================================
   FX: outlines, confetti, beacons, pings
   ========================================================= */
function setOutline(o,mat){for(const m of o.outlines)m.material=mat;}
const flashes=[];
function flashOutline(o,mat,dur){setOutline(o,mat);flashes.push({o,until:performance.now()+dur*1000});}
let revealHi=null,revealTag=null;
// a sign that floats over the answer and shows through walls, so you can see where it was
function labelSprite(text){
  const c=document.createElement('canvas'),x=c.getContext('2d');c.height=72;
  const font='900 34px Nunito, sans-serif';if(x){x.font=font;c.width=Math.min(900,Math.ceil(x.measureText(text).width)+48);}
  if(x){x.font=font;x.fillStyle='#FFD23F';rrect(x,3,3,c.width-6,c.height-6,20);x.fill();x.lineWidth=5;x.strokeStyle='#2B2040';x.stroke();
    x.fillStyle='#2B2040';x.textAlign='center';x.textBaseline='middle';x.fillText(text,c.width/2,c.height/2+2);}
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true,sizeAttenuation:false}));
  s.scale.set(0.075*c.width/c.height,0.075,1);s.renderOrder=30;return s;
}
// the answer's ⭐ on the compass (made on first use: the compass is set up later)
let revealMark=null;
const markEl=()=>revealMark||(revealMark=Object.assign(document.createElement('span'),{className:'tick',textContent:'⭐'}),compassEl.appendChild(revealMark),revealMark);
function setRevealHighlight(id){
  if(revealHi!=null&&W.list[revealHi])setOutline(W.list[revealHi],INK);revealHi=null;beacon.visible=false;
  if(revealTag){scene.remove(revealTag);revealTag.material.map.dispose();revealTag.material.dispose();revealTag=null;}
  markEl().style.display='none';
  if(id==null||!W.list[id])return;const o=W.list[id];revealHi=id;setOutline(o,GOLD);o.obj.visible=true;beacon.visible=true;beacon.userData.o=o;
  revealTag=labelSprite(`It was ${o.n}!`);scene.add(revealTag);
}
const beacon=new THREE.Group();
{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,60,16,1,true),new THREE.MeshBasicMaterial({color:0xFFD23F,transparent:true,opacity:0.28,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
 m.position.y=30;m.raycast=()=>{};beacon.add(m);
 const star=new THREE.Mesh(new THREE.OctahedronGeometry(0.7),new THREE.MeshBasicMaterial({color:0xFFE680}));star.position.y=2.2;star.raycast=()=>{};beacon.add(star);beacon.userData.star=star;
 beacon.visible=false;scene.add(beacon);}
const confetti=[];
const confGeo=new THREE.PlaneGeometry(0.22,0.14);
const confMats=['#FF5D73','#FFD23F','#3DDC97','#4D96FF','#9B5DE5','#FF9F1C'].map(c=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));
function burst(p,n){
  for(let i=0;i<(n||90);i++){const m=new THREE.Mesh(confGeo,confMats[i%confMats.length]);m.position.copy(p);m.raycast=()=>{};
    m.userData={v:new V3(sr(-1,1)*5,Math.random()*9+5,sr(-1,1)*5),s:new V3(Math.random()*8,Math.random()*8,Math.random()*8),life:2.6+Math.random()};
    scene.add(m);confetti.push(m);}
}
const pings=[];
function addPing(x,y,z,col,name){
  const g=new THREE.Group();
  const cm=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,14,12,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.45,depthWrite:false,side:THREE.DoubleSide}));cm.position.y=7;cm.raycast=()=>{};g.add(cm);
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.6,0.95,24),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.9,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=0.08;ring.raycast=()=>{};g.add(ring);
  g.position.set(x,y,z);scene.add(g);
  const el=document.createElement('span');el.className='pingm';el.textContent='📍';compassEl.appendChild(el);
  pings.push({g,ring,until:performance.now()+7000,x,z,el,col});
  sfx.blip();
  const dist=Math.hypot(P.pos.x-x,P.pos.z-z);
  sys(`${name} pinged ${DPH[districtAt(x,y,z)]?DPH[districtAt(x,y,z)].replace(/^(around|along|down by|up on|over in|out on|out at|up in) /,'near '):'a spot'} (${Math.round(dist)}m away).`);
}
let redT=0;function redFlash(){redT=0.35;}
function celebrate(o,d){
  const c=objCenter(o);burst(c);sfx.chime();
  if(d.gp===myPeer())emote('cheer');
}
function updateFx(dt){
  const now=performance.now();
  for(let i=flashes.length-1;i>=0;i--){const f=flashes[i];if(now>f.until){setOutline(f.o,f.o.id===revealHi?GOLD:(f.o.id===Spy.target&&G.spy===myPeer()?SPYMAT:INK));flashes.splice(i,1);}}
  for(let i=confetti.length-1;i>=0;i--){const m=confetti[i],u=m.userData;u.life-=dt;u.v.y-=14*dt;u.v.multiplyScalar(1-1.2*dt);m.position.addScaledVector(u.v,dt);m.rotation.x+=u.s.x*dt;m.rotation.y+=u.s.y*dt;
    if(u.life<=0){scene.remove(m);confetti.splice(i,1);}}
  if(beacon.visible&&beacon.userData.o){const c=objCenter(beacon.userData.o);beacon.position.set(c.x,c.y+1.2,c.z);
    if(revealTag){const b=new THREE.Box3().setFromObject(beacon.userData.o.obj);revealTag.position.set(c.x,(b.isEmpty()?c.y:b.max.y)+1.2,c.z);}beacon.userData.star.rotation.y+=dt*2;beacon.userData.star.position.y=2.2+Math.sin(now/300)*0.3;}
  for(let i=pings.length-1;i>=0;i--){const p=pings[i];const s=1+((now/600)%1)*1.5;p.ring.scale.set(s,s,s);p.ring.material.opacity=0.9*(1-((now/600)%1));
    if(now>p.until){scene.remove(p.g);p.el.remove();pings.splice(i,1);}}
}

