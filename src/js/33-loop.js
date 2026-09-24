/* =========================================================
   Main loop
   ========================================================= */
function onResize(){const w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',onResize);
// far-away small things aren't drawn at all (too small to see or tap from there), and on
// lighter settings far-away things skip their ink outlines (each outline is a second draw)
const Cull={list:[],t:0};
function buildCullList(){
  for(const o of W.list){
    if(o.mv||!o.obj.parent||o.obj.parent!==scene)continue;
    const s=objSize(o);Cull.list.push({obj:o.obj,far:s>3.5?Infinity:GFX.cull*(s<1?0.7:1),ink:o.outlines,inkOn:true});
  }
}
function cullTick(dt){
  Cull.t-=dt;if(Cull.t>0)return;Cull.t=0.25;const cx=camera.position.x,cz=camera.position.z;
  for(const c of Cull.list){
    const p=c.obj.position,d=Math.hypot(p.x-cx,p.z-cz);
    const lit=(revealHi!=null&&W.list[revealHi].obj===c.obj)||(Spy.target!=null&&W.list[Spy.target].obj===c.obj);
    if(c.far!==Infinity)c.obj.visible=lit||d<c.far;   // the answer is always drawn while it's being shown
    const ink=lit||d<GFX.ink;if(ink!==c.inkOn){c.inkOn=ink;for(const m of c.ink)m.visible=ink;}
  }
}
let last=performance.now(),gullT=4,frameN=0;
function frame(now){
  requestAnimationFrame(frame);frameN++;
  const dt=Math.min(0.05,(now-last)/1000);last=now;const t=wclock(),ts=now/1000;
  for(const m of W.movers)m(t,dt);
  waterMat.uniforms.t.value=ts%1000;
  W.foam.material.opacity=0.45+0.25*Math.sin(ts*1.3);W.foam.scale.setScalar(1+0.004*Math.sin(ts*1.3));
  if(myCode&&P.bean){
    updatePlayer(dt);updateCamera(dt);sendPresence();updateRemotes(dt,ts);
    if(P.bean.userData.body)animBean(P.bean,{an:P.an,em:P.em,emAt:P.emAt},ts);
    hostTick();updateHUDTimers();updateCompass();
    gullT-=dt;if(gullT<=0){gullT=5+Math.random()*9;const v=clamp((P.pos.z-18)/30,0,1);if(v>0.05)sfx.gull(v);}
    if(redT>0){redT-=dt;}
  }else{
    const a=ts*0.05;camera.position.set(Math.cos(a)*80,36,Math.sin(a)*80);camera.lookAt(0,3,0);camera.fov=55;camera.updateProjectionMatrix();
  }
  updateFx(dt);cullTick(dt);
  if(GFX.shadow&&!renderer.shadowMap.autoUpdate&&frameN%2===0)renderer.shadowMap.needsUpdate=true;
  renderer.render(scene,camera);
}

