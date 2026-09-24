/* =========================================================
   Phone & tablet controls: a thumbstick, drag to look,
   tap to guess, and a few buttons (chat, binoculars, jump)
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

// Jump and binoculars act the moment a finger lands: a phone never sends a "click" for a
// second finger while the first is still on the stick.
$('#tbtns').addEventListener('pointerdown',e=>{
  e.stopPropagation();
  const b=e.target.closest('button');if(!b)return;audioInit();
  const a=b.dataset.act;
  if(a==='jump'){e.preventDefault();P.jumpReq=true;}
  else if(a==='bino'){e.preventDefault();setBino(!P.bino);}
});
// chat needs a real tap so the phone will bring up its keyboard
$('#tbtns').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.dataset.act!=='chat')return;
  const c=$('#chat');
  if(c.classList.contains('open')){$('#chatInput').blur();return;}
  c.classList.remove('peek');c.classList.add('open');$('#chatInput').focus();
});
$('#chatInput').addEventListener('blur',()=>$('#chat').classList.remove('open'));
$('#clueMore').addEventListener('click',()=>{$('#clue').classList.toggle('open');renderAll();});

// On phones the chat stays out of the way: someone's message shows for a few seconds, then hides.
let peekT=null;
function chatPeek(){
  if(!touchMode)return;
  const c=$('#chat');if(c.classList.contains('open'))return;
  c.classList.add('peek');clearTimeout(peekT);peekT=setTimeout(()=>c.classList.remove('peek'),4500);
}

// Full screen: Android and tablets can do it from a button; iPhone Safari can't, but a
// home-screen install opens without Safari's bars (see the tip on the title screen).
{
  const standalone=matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
  const canFull=!!(document.fullscreenEnabled&&document.documentElement.requestFullscreen);
  const iOS=/iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1&&!canFull);
  const fb=$('#fullBtn'),tip=$('#homeTip');
  fb.hidden=standalone||!canFull||!touchMode;
  fb.addEventListener('click',()=>{document.documentElement.requestFullscreen({navigationUI:'hide'}).then(()=>{try{screen.orientation.lock('landscape').catch(()=>{});}catch(e){}}).catch(()=>{});});
  tip.hidden=standalone||!iOS||!!window.claude;
}
// a little buzz for finds and misses (Android; iPhones don't let websites vibrate)
function buzz(p){if(touchMode&&navigator.vibrate){try{navigator.vibrate(p);}catch(e){}}}
