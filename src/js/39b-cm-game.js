/* =========================================================
   CROWDED MARKET — the game: picking a game, starting a day,
   the local authority loop (your moves, the AI, the clock) and
   your keys. In single player this page is the authority: it
   runs CMSim.tick; a multiplayer host will do the same later.
   ========================================================= */
const CMG={on:false,s:null,init:null,me:'me',mems:[],log:[],acc:0,lastFid:0,target:null,ctx:null,exitArmed:0,cfg:{name:'',col:BEAN_COLORS[1],diff:'normal'}};
try{const c=JSON.parse(localStorage.getItem('cm.me')||'{}');if(typeof c.name==='string')CMG.cfg.name=clean(c.name);if(BEAN_COLORS.includes(c.col))CMG.cfg.col=c.col;if(CM_TUNE.AI.think[c.diff])CMG.cfg.diff=c.diff;}catch(e){}

/* ---------- which game? ---------- */
function showScreen(which){
  $('#picker').hidden=which!=='picker';$('#title').hidden=which!=='wb';$('#cmTitle').hidden=which!=='cm';
  if(which==='wb'){renderSetup();Prev.start();}
  if(which==='cm')cmSetupRender();
}
$('#pickWb').addEventListener('click',()=>{audioInit();showScreen('wb');});
$('#pickCm').addEventListener('click',()=>{audioInit();showScreen('cm');});
$('#wbBack').addEventListener('click',()=>showScreen('picker'));
$('#cmBack').addEventListener('click',()=>showScreen('picker'));
{const wm=$('#cmWordmark');'Crowded Market'.split('').forEach((ch,i)=>{const s=document.createElement('span');s.textContent=ch===' '?' ':ch;s.style.animationDelay=(i*0.04)+'s';s.setAttribute('aria-hidden','true');wm.appendChild(s);});}

function cmSetupRender(){
  $('#cmName').value=CMG.cfg.name;
  const sw=$('#cmSwatches');sw.textContent='';
  for(const c of BEAN_COLORS){if(c===CM_TUNE.RIVALS.undercutter.col)continue;   // that one's Ursula's
    const b=document.createElement('button');b.type='button';b.className='sw';b.style.background=c;b.setAttribute('aria-label','Colour '+c);b.setAttribute('aria-pressed',c===CMG.cfg.col);
    b.onclick=()=>{CMG.cfg.col=c;cmSetupRender();};sw.appendChild(b);}
  for(const b of $('#cmDiff').children)b.setAttribute('aria-pressed',b.dataset.diff===CMG.cfg.diff);
}
$('#cmDiff').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;CMG.cfg.diff=b.dataset.diff;cmSetupRender();});
$('#cmName').addEventListener('input',e=>{CMG.cfg.name=clean(e.target.value);});
$('#cmStart').addEventListener('click',()=>cmStart());
$('#cmName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();cmStart();}});
// straight in: ?market opens its setup, ?market=play starts a day (an invite link goes to Whereabouts)
{const q=new URLSearchParams(location.search);
 if(q.get('room'))showScreen('wb');
 else if(q.has('market')){showScreen('cm');if(q.get('market')==='play'){const go=()=>{if(!$('#loading').hidden||!CMW||!W.list.length){setTimeout(go,200);return;}cmStart();};setTimeout(go,300);}}}

/* ---------- a trading day ---------- */
function cmStart(){
  if(!$('#loading').hidden)return;   // the town isn't built yet
  audioInit();
  const cfg=CMG.cfg;cfg.name=clean($('#cmName').value)||cfg.name||'Bean '+Math.floor(Math.random()*90+10);
  try{localStorage.setItem('cm.me',JSON.stringify(cfg));}catch(e){}
  const R=CM_TUNE.RIVALS.undercutter;
  const seed=1+Math.floor(Math.random()*2147483646);
  CMG.init={seed,diff:cfg.diff,players:[{id:'me',name:cfg.name,col:cfg.col},{id:'u',name:R.name,col:R.col,ai:'undercutter'}]};
  CMG.s=CMSim.newState(CMG.init);
  CMG.mems=CMG.s.order.filter(id=>CMG.s.players[id].ai).map((id,i)=>CMAI.newMem(id,CMG.s.players[id].ai,cfg.diff,seed+i+1));
  CMG.log=[];CMG.acc=0;CMG.lastFid=0;CMG.target=null;CMG.bell=0;
  CMG.on=true;
  shuffleTown(0);cmWorldBuild();
  // you: your chosen colour and a market apron, by your stall looking along the street (the camera behind you stays out of the shops and awnings)
  if(P.bean)scene.remove(P.bean);
  P.bean=makeBean(cfg.col,DEFAULT_FIT,cfg.name);P.bean.userData.tag.visible=false;cmApron(P.bean,cfg.col);
  const me=CMG.s.players.me;P.board=false;P.vel.set(0,0,0);
  const sx=me.x,sz=me.z*0.35;   // a couple of steps out into the street (your first move there is within a run)
  P.pos.set(sx,groundY(sx,sz),sz);P.yaw=Math.PI/2;P.face=P.yaw;P.pitch=0.32;
  $('#picker').hidden=true;$('#title').hidden=true;$('#cmTitle').hidden=true;$('#hud').hidden=true;
  $('#cmHud').hidden=false;$('#cmKeys').hidden=CMH.keysHidden;cmHudReset();
  cmFeed(`🌅 Morning on Market Street. Your stall is the one with your name on it.`,'big');
  cmFeed(`${R.name} (${R.title}) runs the stall next door.`,'rival');
  cmFeed('Fetch stock from the suppliers (look for the signs above them), shelve it, then pitch to customers.');
  cmToast('🌅 Morning!\nThe market is open',2200);sfx.chime();
  tryLock();
}
function cmExit(again,toPicker){
  CMG.on=false;CMG.s=null;
  if(locked)document.exitPointerLock();
  cmWorldClear();
  if(P.bean){scene.remove(P.bean);P.bean=null;}
  $('#cmHud').hidden=true;$('#cmRecap').hidden=true;
  if(!again)showScreen(toPicker?'picker':'cm');
}
$('#cmExit').addEventListener('click',()=>{
  if(CMG.s&&CMG.s.phase==='day'&&Date.now()>CMG.exitArmed){CMG.exitArmed=Date.now()+3000;$('#cmExit').textContent='Tap again to leave';$('#cmExit').classList.add('armed');
    setTimeout(()=>{$('#cmExit').textContent='🚪 Leave';$('#cmExit').classList.remove('armed');},3000);return;}
  CMG.exitArmed=0;cmExit(false);
});

// one step of the simulation: your position, the AI's moves, then the clock
function cmStep(){
  const s=CMG.s;
  const act=a=>{CMG.log.push([s.tick,a]);return CMSim.applyAction(s,a);};
  act({type:'move',player:CMG.me,x:Math.round(P.pos.x*100)/100,z:Math.round(P.pos.z*100)/100});
  for(const m of CMG.mems)for(const a of CMAI.step(s,m,CMW.grid))act(a);
  CMSim.tick(s);
}
// your own actions: logged like everything else, with a word about why when they don't work
const CM_WHY={far:'Too far away',full:'Your arms are full!',broke:'Not enough coins',empty:'Nothing to shelve',shelffull:'The shelf is full',
  nostock:'You don’t have that on your shelf',reach:'They’re too far from your stall',already:'You just pitched them',busy:'They’re busy',gone:'They’ve gone',belowcost:'Can’t sell below cost'};
function cmAct(a){
  const s=CMG.s;if(!s||s.phase!=='day')return null;
  a.player=CMG.me;CMG.log.push([s.tick,a]);
  const r=CMSim.applyAction(s,a);
  if(!r.ok&&r.reason!=='pricey'&&CM_WHY[r.reason]){cmToast(CM_WHY[r.reason],1200);sfx.thud();}
  return r;
}

/* ---------- what E does here ---------- */
function cmPickCustomer(s){
  const T=CM_TUNE,fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);let best=null,bs=Infinity;
  for(const c of s.cust){
    if(c.ph!=='walk'&&c.ph!=='think')continue;
    const dx=c.x-P.pos.x,dz=c.z-P.pos.z,d=Math.hypot(dx,dz);if(d>T.PITCH_RANGE)continue;
    const ang=Math.acos(clamp((dx*fx+dz*fz)/Math.max(d,1e-3),-1,1));
    const sc=ang+d*0.12;if(sc<bs){bs=sc;best=c;}
  }
  return best;
}
function cmContext(s){
  const T=CM_TUNE,me=s.players[CMG.me],st=s.stalls[me.stall],held=CMSim.carried(me);
  const px=P.pos.x,pz=P.pos.z;
  for(const [g,sp] of Object.entries(s.sup)){
    if(Math.hypot(px-sp.x,pz-sp.z)>T.SUPPLIER_RANGE)continue;
    const G=T.GOODS[g],cost=G.cost;
    if(held>=T.CARRY)return {kind:'none',text:'Your arms are full. Take it to your stall!',tone:'bad'};
    if(me.coins<cost)return {kind:'none',text:`${G.icon} costs ${cost}. You only have ${me.coins} 🪙`,tone:'bad'};
    return {kind:'buy',g,key:'E',text:`Buy ${G.icon} ${G.name} · 🪙${cost} each`,sub:`${held}/${T.CARRY} in your arms · Shift+E for an armful`};
  }
  const atMine=CMSim.atStall({x:px,z:pz},st);
  if(atMine&&held)return {kind:'shelve',key:'E',text:`Put ${held} thing${held>1?'s':''} on your shelf`,tone:'good'};
  const c=cmPickCustomer(s);
  if(c){
    const w=c.want[0],G=T.GOODS[w.item],have=st.stock[w.item]||0,price=st.price[w.item];
    const reach=Math.hypot(c.x-st.x,c.z-st.fz)<=T.STALL_REACH;
    if(!reach)return {kind:'none',cust:c.id,text:`Wants ${G.icon} (up to ${w.max}), but they’re too far from your stall`,tone:'bad'};
    if(!have)return {kind:'none',cust:c.id,text:`Wants ${G.icon} ${G.name} (up to ${w.max}). You have none!`,tone:'bad'};
    if(price>w.max)return {kind:'pitch',cust:c.id,key:'E',text:`Wants ${G.icon} up to ${w.max}. Yours is ${price}: too pricey`,tone:'bad'};
    return {kind:'pitch',cust:c.id,key:'E',text:`Pitch ${G.icon} for 🪙${price}`,sub:`they’ll pay up to ${w.max}`,tone:'good'};
  }
  if(atMine&&!held)return {kind:'none',text:'Your stall. Fetch stock from a supplier, then pitch to passing customers.'};
  return null;
}
function cmInteract(all){
  const s=CMG.s;if(!s||s.phase!=='day')return;
  const ctx=cmContext(s);if(!ctx)return;
  if(ctx.kind==='buy'){const r=cmAct({type:'buy',item:ctx.g,n:all?CM_TUNE.CARRY:1});if(r&&r.ok)sfx.pop();}
  else if(ctx.kind==='shelve'){const r=cmAct({type:'shelve'});if(r&&r.ok){sfx.blip();buzz(20);}}
  else if(ctx.kind==='pitch')cmPitch(ctx.cust);
  else if(ctx.text){cmToast(ctx.text.split('. ')[0],1300);}
}
function cmPitch(id){const r=cmAct({type:'pitch',cust:id});if(r&&r.ok){sfx.tick();emote('point');}}
// a click: the customer you clicked, or whatever E would do
function cmClick(nx,ny){
  const meshes=[];for(const [id,v] of CMW.cust)v.m.traverse(o=>{if(o.isMesh&&!o.userData.isOutline){o.userData.cmCust=id;meshes.push(o);}});
  const h=rayAt(nx,ny,meshes);
  if(h&&h.object.userData.cmCust){const c=CMG.s.cust.find(c=>c.id===h.object.userData.cmCust);
    if(c&&Math.hypot(c.x-P.pos.x,c.z-P.pos.z)<=CM_TUNE.PITCH_RANGE){cmPitch(c.id);return;}
    if(c){cmToast('Get closer to pitch',1000);return;}}
  cmInteract(false);
}
// the market's keys (movement, look, jump, emotes and mute are shared with Whereabouts)
function cmKey(e){
  if(e.code==='KeyE'){cmInteract(e.shiftKey);return true;}
  if(e.code==='Tab'){e.preventDefault();$('#cmTab').hidden=false;cmTabRender(CMG.s);return true;}
  if(e.code==='KeyH'){CMH.keysHidden=!CMH.keysHidden;$('#cmKeys').hidden=CMH.keysHidden;return true;}
  if(e.code==='KeyQ'){cmPing();return true;}
  if(e.code==='KeyM'){toggleMute();return true;}
  if(/^Digit[1-5]$/.test(e.code)){emote(['wave','point','dance','shrug','cheer'][+e.code.slice(5)-1]);return true;}
  return e.code==='KeyB'||e.code==='KeyT'||e.code==='Enter';   // no rides or chat in the market
}
function cmKeyUp(e){if(e.code==='Tab')$('#cmTab').hidden=true;}
function cmPing(){
  const h=(locked||touchMode)?rayAt(0,0,W.ray.concat(W.pickables)):rayAt(mouseNdc.x,mouseNdc.y,W.ray.concat(W.pickables));
  if(h)addPing(h.point.x,h.point.y,h.point.z,CMG.cfg.col,'You');
}

/* ---------- what happened: the feed, sounds and bubbles ---------- */
function cmOnEvent(s,e){
  const T=CM_TUNE,who=id=>id===CMG.me?'You':(s.players[id]||{name:'?'}).name,mine=e.p===CMG.me,cls=mine?'me':'rival';
  switch(e.k){
    case 'sale':
      if(mine){sfx.coin();buzz(30);cmFeed(`🪙 Sold ${cmIcon(e.item)} for ${e.price}`,'me');}
      else cmFeed(`${who(e.p)} sold ${cmIcon(e.item)} for ${e.price}`,'rival');
      break;
    case 'undercut':cmFeed(mine?`You dropped ${cmIcon(e.item)} to ${e.price}`:`${who(e.p)} dropped ${cmIcon(e.item)} to ${e.price}`,cls);if(!mine)sfx.tick();break;
    case 'price':if(mine)cmFeed(`${cmIcon(e.item)} is now ${e.price}`,'me');break;
    case 'buy':cmFeed(mine?`Bought ${cmIcon(e.item)}×${e.n} for 🪙${e.cost}`:`${who(e.p)} stocked up on ${cmIcon(e.item)}`,cls);break;
    case 'shelve':if(mine)cmFeed(`Shelved ${e.n} thing${e.n>1?'s':''}`,'me');break;
    case 'pricey':if(mine){const c=s.cust.find(c=>c.id===e.cust);cmToast(c?`Too pricey!\nThey’ll pay up to ${c.want[0].max}`:'Too pricey!',1500);sfx.thud();}break;
    case 'chose':{
      const c=s.cust.find(c=>c.id===e.cust);
      if(mine){cmToast(`They’ll take it!\n${cmIcon(e.item)} for ${e.price}`,1300);sfx.hint();}
      else if(c&&c.pitched[CMG.me]!=null){cmFeed(`Lost a customer to ${who(e.p)} (${cmIcon(e.item)} ${e.price})`,'rival');sfx.sad();}
      break;
    }
    case 'soldout':if(mine){cmToast('Sold out before they got there!',1500);sfx.thud();}break;
    case 'part':{const p=T.PARTS.find(p=>p.k===e.part);cmToast(`${p.icon} ${p.label}`,1800);cmFeed(`${p.icon} ${p.label}: more customers now!`,'big');cmBell();break;}
    case 'say':cmSay(e.p,e.text);cmFeed(`${who(e.p)}: “${e.text}”`,'rival say');break;
    case 'close':cmBell();sfx.fanfare();cmFeed('🔔 Closing time!','big');cmRecapShow(s);break;
  }
}
function cmBell(){[1568,1175,1568,1175].forEach((f,i)=>tone(f,0.9,'sine',0.12,i*0.28));}

/* ---------- every frame (called from the main loop) ---------- */
function cmFrame(dt,ts){
  const s=CMG.s;if(!s)return;
  dt=Math.max(0,dt);
  if(s.phase==='day'){
    CMG.acc+=dt;let n=0;
    while(CMG.acc>=CM_TUNE.DT&&n<5){cmStep();CMG.acc-=CM_TUNE.DT;n++;}
    if(n===5)CMG.acc=0;   // a long hitch: skip ahead rather than race to catch up
    if(CM_TUNE.DAY-s.t<=30&&!CMG.bell){CMG.bell=1;cmToast('🔔 30 seconds\nuntil closing!',1800);cmBell();}
  }
  for(const e of s.feed)if(e.id>CMG.lastFid){CMG.lastFid=e.id;cmOnEvent(s,e);}
  CMG.ctx=s.phase==='day'?cmContext(s):null;
  CMG.target=CMG.ctx&&CMG.ctx.cust||null;
  cmWorldSync(s,dt,ts,CMG.target);
  cmPromptRender(CMG.ctx);
  cmHudRender(s,dt);
}
// for the console and dev checks
window.__cm={CMG,CMW,CMSim,CMAI,CMNav,CM_TUNE,cmStart,cmExit,cmStep,showScreen};
