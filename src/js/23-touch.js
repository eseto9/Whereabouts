/* =========================================================
   Phone & tablet controls: a thumbstick, drag to look,
   tap to guess, and buttons for everything on the keyboard
   ========================================================= */
let touchMode=false;
const joy={id:null,x:0,y:0};
function enableTouch(){
  if(touchMode)return;touchMode=true;noLock=true;
  document.documentElement.classList.add('touch');$('#touchUI').hidden=false;
  $('#chatInput').placeholder='Say something';updateTip();
}
if(window.matchMedia&&matchMedia('(pointer:coarse)').matches)enableTouch();

const joyEl=$('#joy'),knob=$('#joyKnob');
function joySet(e){
  const r=joyEl.getBoundingClientRect(),R=r.width/2,m=R*0.72;
  let dx=e.clientX-(r.left+R),dy=e.clientY-(r.top+R);const d=Math.hypot(dx,dy);
  if(d>m){dx*=m/d;dy*=m/d;}
  joy.x=dx/m;joy.y=dy/m;knob.style.transform=`translate(${dx}px,${dy}px)`;
}
function joyEnd(e){e.stopPropagation();if(e.pointerId!==joy.id)return;joy.id=null;joy.x=joy.y=0;knob.style.transform='';}
// the stick keeps its own finger: nothing it does reaches the look-around handlers
joyEl.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();audioInit();joy.id=e.pointerId;try{joyEl.setPointerCapture(e.pointerId);}catch(err){}joySet(e);});
joyEl.addEventListener('pointermove',e=>{e.stopPropagation();if(e.pointerId===joy.id)joySet(e);});
joyEl.addEventListener('pointerup',joyEnd);
joyEl.addEventListener('pointercancel',joyEnd);

for(const el of [$('#tbtns'),$('#emoteRow')])el.addEventListener('pointerdown',e=>e.stopPropagation());
$('#tbtns').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;audioInit();
  const a=b.dataset.act;
  if(a==='jump')P.jumpReq=true;
  else if(a==='bino')setBino(!P.bino);
  else if(a==='ping')doPing();
  else if(a==='emote')$('#emoteRow').hidden=!$('#emoteRow').hidden;
  else if(a==='chat'){$('#chat').classList.add('open');$('#chatInput').focus();}
});
$('#emoteRow').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;emote(b.dataset.em);$('#emoteRow').hidden=true;});
$('#chatInput').addEventListener('blur',()=>$('#chat').classList.remove('open'));
$('#clueMore').addEventListener('click',()=>{$('#clue').classList.toggle('open');renderAll();});
