/* =========================================================
   Main loop
   ========================================================= */
function onResize(){const w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();drawBinoMask();}
window.addEventListener('resize',onResize);
let last=performance.now(),gullT=4;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(0.05,(now-last)/1000);last=now;const t=wclock(),ts=now/1000;
  for(const m of W.movers)m(t,dt);
  waterMat.uniforms.t.value=ts%1000;
  W.foam.material.opacity=0.45+0.25*Math.sin(ts*1.3);W.foam.scale.setScalar(1+0.004*Math.sin(ts*1.3));
  if(myCode&&P.bean){
    updatePlayer(dt);updateCamera(dt);sendPresence();updateRemotes(dt,ts);
    animBean(P.bean,{an:P.an,em:P.em,emAt:P.emAt},ts);
    hostTick();updateHUDTimers();updateCompass();
    gullT-=dt;if(gullT<=0){gullT=5+Math.random()*9;const v=clamp((P.pos.z-18)/30,0,1);if(v>0.05)sfx.gull(v);}
    if(redT>0){redT-=dt;}
  }else{
    const a=ts*0.05;camera.position.set(Math.cos(a)*80,36,Math.sin(a)*80);camera.lookAt(0,3,0);camera.fov=55;camera.updateProjectionMatrix();
  }
  updateFx(dt);
  renderer.render(scene,camera);
}

