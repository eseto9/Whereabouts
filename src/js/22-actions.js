/* =========================================================
   Player actions
   ========================================================= */
const mouseNdc={x:0,y:0};
window.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mouseNdc.x=((e.clientX-r.left)/r.width)*2-1;mouseNdc.y=-((e.clientY-r.top)/r.height)*2+1;});
const shortName=o=>o.n.replace(/^(the|a|an) /,'');
function clickAt(nx,ny){
  const h=rayAt(nx,ny,W.ray);const fid=h?h.object.userData.fid:undefined;
  if(G.phase==='pick'&&G.spy===myPeer()){if(fid!==undefined)spySelect(fid);return;}
  if(fid===undefined)return;
  const o=W.list[fid];
  if(G.phase==='clue'){
    if(G.kind==='player'&&G.spy===myPeer()){toast('You’re the Spy, so no guessing!');return;}
    if(Date.now()<guessCD)return;guessCD=Date.now()+1200;
    sfx.tick();flashOutline(o,GOLD,0.35);
    emit('wb.guess',{r:G.r,id:fid,n:myName});
  }else if(o.k==='clothes shop'){sfx.pop();flashOutline(o,GOLD,0.9);openWardrobe('shop');}
  else{toast(o.n.charAt(0).toUpperCase()+o.n.slice(1));sfx.pop();flashOutline(o,GOLD,0.9);}
}
let lastPing=0;
function doPing(){
  const now=Date.now();if(now-lastPing<900)return;
  const h=(locked||touchMode)?rayAt(0,0,W.ray.concat(W.pickables)):rayAt(mouseNdc.x,mouseNdc.y,W.ray.concat(W.pickables));
  if(!h)return;lastPing=now;
  emit('wb.ping',{x:Math.round(h.point.x*100)/100,y:Math.round(h.point.y*100)/100,z:Math.round(h.point.z*100)/100});
}
function sendChat(text,spy){
  const t=clean(text,160);if(!t)return;emit('wb.chat',{t,spy:!!spy});
}
const chatInput=$('#chatInput');
chatInput.addEventListener('focus',()=>{chatFocus=true;});
chatInput.addEventListener('blur',()=>{chatFocus=false;});
chatInput.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();sendChat(chatInput.value);chatInput.value='';chatInput.blur();canvas.focus();}
});

/* ---------- the Spy's tools ---------- */
function spySelect(fid){
  if(Spy.target!=null&&W.list[Spy.target])setOutline(W.list[Spy.target],INK);
  Spy.target=fid;Spy.r=G.r;setOutline(W.list[fid],SPYMAT);sfx.pop();
  if(locked)document.exitPointerLock();
  renderSpy(true);
}
function clearSpy(){if(Spy.target!=null&&W.list[Spy.target])setOutline(W.list[Spy.target],INK);Spy.target=null;Spy.r=-1;}

