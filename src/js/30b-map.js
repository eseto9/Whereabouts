/* =========================================================
   Map: a picture of the whole island taken from straight
   above when the town is built, with the area names, you,
   your friends and team pings on top. Clues that say "look
   up on Hillside" light that area up on the map.
   ========================================================= */
const MAP={x0:-78,x1:128,z0:-74,z1:74,img:null,url:'',open:false};
const MAP_W=824,MAP_H=Math.round(MAP_W*(MAP.z1-MAP.z0)/(MAP.x1-MAP.x0));
const AREAS=[['square','Town Square',0,2],['market','Market Street',40,0],['harbor','Harbor',2,50],['hill','Hillside',-2,-44],['hill','Windmill Green',42,-26],
  ['park','Park',-40,8],['farm','Farm',80,24],['orchard','Orchard',82,-18]];
function buildMapImage(){
  try{
    const cam=new THREE.OrthographicCamera(MAP.x0,MAP.x1,-MAP.z0,-MAP.z1,1,600);
    cam.position.set(0,300,0);cam.up.set(0,0,-1);cam.lookAt(0,0,0);
    // hide what floats above the town (clouds, balloons, the blimp), and the fog
    const hidden=[];for(const o of W.list){const p=o.obj.position;if(p.y>16&&o.obj.visible){o.obj.visible=false;hidden.push(o.obj);}}
    const fog=scene.fog;scene.fog=null;
    const rt=new THREE.WebGLRenderTarget(MAP_W,MAP_H);
    renderer.setRenderTarget(rt);renderer.render(scene,cam);
    const px=new Uint8Array(MAP_W*MAP_H*4);renderer.readRenderTargetPixels(rt,0,0,MAP_W,MAP_H,px);
    renderer.setRenderTarget(null);rt.dispose();scene.fog=fog;for(const o of hidden)o.visible=true;
    const c=document.createElement('canvas');c.width=MAP_W;c.height=MAP_H;const x=c.getContext('2d');const id=x.createImageData(MAP_W,MAP_H);
    for(let j=0;j<MAP_H;j++)id.data.set(px.subarray((MAP_H-1-j)*MAP_W*4,(MAP_H-j)*MAP_W*4),j*MAP_W*4);   // the GPU's rows run bottom-up
    x.putImageData(id,0,0);MAP.img=c;
  }catch(e){MAP.img=null;}
}
const mapPt=(x,z,W_,H_)=>[(x-MAP.x0)/(MAP.x1-MAP.x0)*W_,(z-MAP.z0)/(MAP.z1-MAP.z0)*H_];
// which area the current clue points at, read from its "look …" line
function clueArea(){
  if(G.phase!=='clue')return null;
  for(const l of G.lines||[])for(const [k,ph] of Object.entries(DPH))if(l.includes(ph))return k;
  return null;
}
function drawMap(cv,big){
  const x=cv.getContext('2d');if(!x)return;const W_=cv.width,H_=cv.height;
  x.clearRect(0,0,W_,H_);
  if(MAP.img)x.drawImage(MAP.img,0,0,W_,H_);else{x.fillStyle='#4D96FF';x.fillRect(0,0,W_,H_);}
  const hot=clueArea(),t=performance.now()/1000;
  // area names
  x.textAlign='center';x.textBaseline='middle';
  for(const [k,label,ax,az] of AREAS){
    const [px,py]=mapPt(ax,az,W_,H_);const fs=big?Math.max(13,W_/48):Math.max(9,W_/22);
    x.font=`${fs}px "Lilita One", sans-serif`;
    const on=hot===k,w=x.measureText(label).width+fs*0.9,h=fs*1.45;
    x.fillStyle=on?`rgba(255,210,63,${0.75+0.25*Math.sin(t*5)})`:'rgba(255,255,255,0.82)';
    rrect(x,px-w/2,py-h/2,w,h,h/2);x.fill();x.lineWidth=on?3:2;x.strokeStyle='#2B2040';x.stroke();
    x.fillStyle='#2B2040';x.fillText(label,px,py+1);
  }
  // golden acorns and shells
  for(const it of Pickups.items){const [px,py]=mapPt(it.x,it.z,W_,H_),r=big?5:3;x.beginPath();x.arc(px,py,r,0,TAU);x.fillStyle='#FFC933';x.fill();x.lineWidth=big?2:1.2;x.strokeStyle='#7A5200';x.stroke();}
  // pings
  for(const p of pings){const [px,py]=mapPt(p.x,p.z,W_,H_);x.font=`${big?22:13}px sans-serif`;x.fillText('📍',px,py-6);}
  // friends, then you (an arrow pointing where you face)
  for(const [peer,r] of Remote){const p=players().find(q=>q.peer===peer);const col=p&&p.presence&&safeCol(p.presence.col)||'#FFFFFF';
    const [px,py]=mapPt(r.bean.position.x,r.bean.position.z,W_,H_);x.beginPath();x.arc(px,py,big?7:4.5,0,TAU);x.fillStyle=col;x.fill();x.lineWidth=2;x.strokeStyle='#2B2040';x.stroke();
    if(big&&p&&p.presence&&p.presence.name){x.font='bold 12px Nunito, sans-serif';x.fillStyle='#2B2040';x.fillText(clean(p.presence.name),px,py-14);}}
  if(P.bean){const [px,py]=mapPt(P.pos.x,P.pos.z,W_,H_),s=big?13:8,a=Math.atan2(Math.sin(P.face),Math.cos(P.face));
    x.save();x.translate(px,py);x.rotate(-a+Math.PI);x.beginPath();x.moveTo(0,-s);x.lineTo(s*0.75,s*0.8);x.lineTo(0,s*0.35);x.lineTo(-s*0.75,s*0.8);x.closePath();
    x.fillStyle=myCol;x.fill();x.lineWidth=2.5;x.strokeStyle='#2B2040';x.stroke();x.restore();}
}
function setMap(open){MAP.open=open;$('#mapView').hidden=!open;if(open)drawMap($('#mapBig'),true);}
let miniT=0;
function mapTick(dt){
  miniT-=dt;
  if(MAP.open){drawMap($('#mapBig'),true);return;}
  if(miniT<=0&&!touchMode&&myCode){miniT=0.2;const m=$('#miniMap');if(m&&m.offsetParent)drawMap(m,false);}
}
$('#miniMap').addEventListener('click',()=>setMap(true));
$('#mapClose').addEventListener('click',()=>setMap(false));
$('#mapView').addEventListener('click',e=>{if(e.target.id==='mapView')setMap(false);});
