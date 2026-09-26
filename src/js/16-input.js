/* =========================================================
   Input
   ========================================================= */
let locked=false,noLock=false,suppressClick=false,dragging=null;
const SENS=0.00432;   // 1× here is what used to be 1.8×
// look speed, set on the title screen (0.5× to 3×), kept per device
const Look={mult:1};
try{const v=parseFloat(localStorage.getItem('wb.sens'));if(v>=0.5&&v<=3)Look.mult=v;}catch(e){}
function inGame(){return !!myCode;}
function look(dx,dy){
  const k=SENS*Look.mult;P.yaw-=dx*k;P.pitch=clamp(P.pitch+dy*k,-0.25,1.15);
}
let lockEverWorked=false;
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;if(locked)lockEverWorked=true;updateTip();});
document.addEventListener('pointerlockerror',()=>{noLock=true;locked=false;updateTip();});
function tryLock(){
  if(noLock||locked) return;
  try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{noLock=true;updateTip();});}catch(e){noLock=true;updateTip();return;}
  setTimeout(()=>{if(!locked&&document.pointerLockElement!==canvas&&!lockEverWorked){noLock=true;updateTip();}},900);
}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{
  audioInit();
  if(e.pointerType==='touch')enableTouch();
  if(!inGame()) return;
  if(e.button!==0) return;
  if(dragging&&dragging.id!==e.pointerId) return;   // one look-around finger at a time
  if(!locked&&!noLock){tryLock();suppressClick=true;dragging={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0};return;}
  dragging={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0};
});
window.addEventListener('pointercancel',e=>{if(dragging&&dragging.id===e.pointerId)dragging=null;});
window.addEventListener('pointerup',e=>{
  if(e.button!==0||!dragging||dragging.id!==e.pointerId) return;
  const d=dragging;dragging=null;
  if(suppressClick){suppressClick=false;return;}
  if(d.moved>6) return;
  if(!inGame()) return;
  if(locked) clickAt(0,0);
  else{const r=canvas.getBoundingClientRect();clickAt(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);}
});
window.addEventListener('pointermove',e=>{
  if(!inGame()) return;
  if(locked){look(e.movementX||0,e.movementY||0);return;}
  if(dragging&&dragging.id===e.pointerId){const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;dragging.moved+=Math.abs(dx)+Math.abs(dy);dragging.x=e.clientX;dragging.y=e.clientY;look(dx*1.3,dy*1.3);}
});
window.addEventListener('keydown',e=>{
  const typing=document.activeElement&&(document.activeElement.tagName==='INPUT'||document.activeElement.tagName==='TEXTAREA');
  if(typing){if(e.key==='Escape')document.activeElement.blur();return;}
  if(!inGame()) return;
  keys[e.code]=true;
  if(e.code==='Space') e.preventDefault();
  if(e.repeat) return;
  audioInit();
  if(e.code==='Enter'){e.preventDefault();if(locked)document.exitPointerLock();$('#chatInput').focus();}
  else if(e.code==='KeyQ') doPing();
  else if(e.code==='KeyM') toggleMute();
  else if(e.code==='KeyB') rideTap();
  else if(e.code==='KeyT') doTrick();
  else if(e.code==='Tab'){e.preventDefault();setMap(!MAP.open);}
  else if(e.code==='Escape'&&MAP.open) setMap(false);
  else if(e.code==='KeyH') $('#side').hidden=!$('#side').hidden;
  else if(/^Digit[1-5]$/.test(e.code)) emote(['wave','point','dance','shrug','cheer'][+e.code.slice(5)-1]);
});
window.addEventListener('keyup',e=>{keys[e.code]=false;});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
function emote(name){P.em=name;P.emAt=Date.now();sendPresence(true);}

const raycaster=new THREE.Raycaster();
function chainVisible(o){while(o){if(!o.visible)return false;o=o.parent;}return true;}
function rayAt(nx,ny,list){
  raycaster.setFromCamera({x:nx,y:ny},camera);raycaster.far=600;
  const hits=raycaster.intersectObjects(list,false);
  for(const h of hits){if(chainVisible(h.object))return h;}
  return null;
}

