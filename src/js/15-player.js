/* =========================================================
   Local player
   ========================================================= */
const P={board:false,pos:new V3(sr(-3,3),0.4,sr(4,7)),vel:new V3(),yaw:Math.PI,pitch:0.32,face:Math.PI,onGround:true,an:0,em:null,emAt:0,bean:null,wob:0};
const keys={};
let chatFocus=false;
function updatePlayer(dt){
  if(!P.bean) return;
  const f=new V3(Math.sin(P.yaw),0,Math.cos(P.yaw)), r=new V3(-Math.cos(P.yaw),0,Math.sin(P.yaw));
  let fw=0,st=0;
  const frozen=frozenSeeker();
  if(!chatFocus&&!frozen){if(keys.KeyW||keys.ArrowUp)fw+=1;if(keys.KeyS||keys.ArrowDown)fw-=1;if(keys.KeyD||keys.ArrowRight)st+=1;if(keys.KeyA||keys.ArrowLeft)st-=1;fw-=joy.y;st+=joy.x;}
  const dir=f.multiplyScalar(fw).add(r.multiplyScalar(st));
  const moving=dir.lengthSq()>0.04; if(moving) dir.normalize(); else dir.set(0,0,0);
  // one steady speed (the stick only steers); Shift is a deliberate run on a keyboard
  const run=keys.ShiftLeft||keys.ShiftRight;
  const speed=P.board?RIDE_INFO[rideOf(myFit)].speed:run?11:8;   // rides are the quick way across town
  P.vel.x=lerp(P.vel.x,dir.x*speed,damp(P.onGround?12:4,dt));
  P.vel.z=lerp(P.vel.z,dir.z*speed,damp(P.onGround?12:4,dt));
  if(!chatFocus&&!frozen&&(keys.Space||P.jumpReq)&&P.onGround){P.vel.y=8.6;P.onGround=false;sfx.jump();}
  P.jumpReq=false;
  P.vel.y-=24*dt;
  // horizontal move with walkability check per axis
  const nx=P.pos.x+P.vel.x*dt, nz=P.pos.z+P.vel.z*dt;
  if(walkable(nx,P.pos.z)) P.pos.x=nx; else P.vel.x=0;
  if(walkable(P.pos.x,nz)) P.pos.z=nz; else P.vel.z=0;
  collide(P.pos);
  // bump other beans
  for(const rb of Remote.values()){const dx=P.pos.x-rb.bean.position.x,dz=P.pos.z-rb.bean.position.z,d=Math.hypot(dx,dz);
    if(d<1&&d>1e-3&&Math.abs(P.pos.y-rb.bean.position.y)<1.4){P.pos.x+=dx/d*(1-d)*0.6;P.pos.z+=dz/d*(1-d)*0.6;P.wob=0.4;}}
  const gy=groundY(P.pos.x,P.pos.z);
  P.pos.y+=P.vel.y*dt;
  if(P.pos.y<=gy){P.pos.y=gy;P.vel.y=0;P.onGround=true;}
  else if(P.onGround&&P.vel.y<=0&&P.pos.y-gy<0.6){P.pos.y=gy;P.vel.y=0;}
  else P.onGround=false;
  const hs=Math.hypot(P.vel.x,P.vel.z);
  if(hs>0.5) P.face=angLerp(P.face,Math.atan2(P.vel.x,P.vel.z),damp(14,dt));
  P.an=!P.onGround?3:P.board?0:hs>8?2:hs>0.8?1:0;
  P.bean.position.copy(P.pos);if(P.board)P.bean.position.y+=rideLift(myFit);P.bean.rotation.y=P.face;
  if(P.wob>0){P.wob-=dt;P.bean.rotation.z=Math.sin(P.wob*30)*0.12*P.wob;}else P.bean.rotation.z=0;
}
function collide(p){
  const R=0.45;
  for(const o of W.obstacles){
    if(o.t===0){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz),m=o.r+R;if(d<m){if(d>1e-4){p.x=o.x+dx/d*m;p.z=o.z+dz/d*m;}else p.x=o.x+m;}}
    else{const cx=clamp(p.x,o.x0,o.x1),cz=clamp(p.z,o.z0,o.z1);const dx=p.x-cx,dz=p.z-cz,d=Math.hypot(dx,dz);
      if(d<R){if(d>1e-4){p.x=cx+dx/d*R;p.z=cz+dz/d*R;}
        else{const l=p.x-o.x0,r=o.x1-p.x,t=p.z-o.z0,b=o.z1-p.z,m=Math.min(l,r,t,b);
          if(m===l)p.x=o.x0-R;else if(m===r)p.x=o.x1+R;else if(m===t)p.z=o.z0-R;else p.z=o.z1+R;}}}
  }
}
// hop on or off the hoverboard (the 🛹 button on phones, B on a keyboard)
function setBoard(on){
  if(on===P.board)return;P.board=on;sfx.jump();buzz(20);sendPresence(true);
  // the first few rides: tell people tricks exist
  if(on){let n=0;try{n=+localStorage.getItem('wb.tkTip')||0;}catch(e){}
    if(n<3){try{localStorage.setItem('wb.tkTip',String(n+1));}catch(e){}setTimeout(()=>{if(P.board)toast(touchMode?'Double-tap Ride for a trick!':'Press T for a trick!',2200);},700);}}
  for(const b of document.querySelectorAll('[data-act=board]'))b.setAttribute('aria-pressed',on);
}
// Ride button: one tap hops on or off; a quick double-tap while riding does a trick instead
let rideTapT=null;
function rideTap(){
  if(!P.board){setBoard(true);return;}
  if(rideTapT){clearTimeout(rideTapT);rideTapT=null;doTrick();return;}
  rideTapT=setTimeout(()=>{rideTapT=null;setBoard(false);},300);
}
function doTrick(){
  const tr=TRICKS[rideOf(myFit)];if(!P.board||!tr||Date.now()-(P.tk||0)<tr.dur*1000+150)return;
  P.tk=Date.now();sfx.zoom();sfx.pop();buzz(25);sendPresence(true);bumpStat('tricks');
}
const camTmp=new V3(),lookTmp=new V3();
function updateCamera(dt){
  const head=camTmp.set(P.pos.x,P.pos.y+1.35,P.pos.z);
  camera.fov=lerp(camera.fov,P.board&&Math.hypot(P.vel.x,P.vel.z)>6?70:62,damp(P.board?3:12,dt));
  const dist=7.2,cp=Math.cos(P.pitch);
  let cx=head.x-Math.sin(P.yaw)*dist*cp,cy=head.y+Math.sin(P.pitch)*dist+0.3,cz=head.z-Math.cos(P.yaw)*dist*cp;
  cy=Math.max(cy,Math.max(landH(cx,cz),-0.45)+0.6);
  camera.position.set(cx,cy,cz);
  camera.lookAt(head.x+Math.sin(P.yaw)*3,head.y+0.6,head.z+Math.cos(P.yaw)*3);
  P.bean.visible=true;
  camera.updateProjectionMatrix();
}

