/* =========================================================
   Wallet & shop: coins for finding things (more for finding
   them fast), spent on clothes. Per player: this browser, plus
   your private corner of the db when the artifact has one.
   ========================================================= */
// everything not listed here is part of the free starter wardrobe
const PRICES={
  'top:sweater':50,'top:raincoat':100,'top:puffer':120,'top:hawaii':150,'top:varsity':180,'top:tux':240,'top:cape':320,'top:space':360,'top:armor':440,'top:dino':560,
  'bot:skirt':50,'bot:overalls':100,'bot:tutu':150,'bot:hula':160,
  'shoe:boots':70,'shoe:flippers':110,'shoe:cowboy':130,'shoe:bunny':180,'shoe:rollers':210,'shoe:glow':240,'shoe:rocket':520,
  'pat:dots':40,'pat:checks':60,'pat:stars':120,'pat:rainbow':260,
  'x:scarf':30,'x:bowtie':50,'x:shades':60,'x:glasses':60,'x:backpack':80,'x:floatie':120,'x:balloon':150,'x:guitar':200,'x:wings':280,'x:jetpack':400,'x:medal':480,'x:buddy':640,
  'ride:carpet':200,'ride:cloud':320,'ride:rocket':480,'ride:ufo':720,
};
// earned, not bought: each one unlocks when you reach its goal
const UNLOCKS={
  'x:party':{goal:'friends',n:3,text:'Finish 3 games with friends'},
  'top:detective':{goal:'quick',n:10,text:'Find 10 things in under 15 seconds each'},
  'x:cap':{goal:'tricks',n:25,text:'Do 25 ride tricks'},
  'x:tail':{goal:'gold',n:30,text:'Collect 30 golden acorns and shells'},
  'x:crown':{goal:'finds',n:50,text:'Find 50 things'},
  'shoe:gold':{goal:'days',n:3,text:'Play the daily challenge on 3 different days'},
  'top:ninja':{goal:'hard',n:1,text:'Win a Hard game (find at least half the clues)'},
  'ride:dragon':{goal:'finds',n:150,text:'Find 150 things'},
};
const isPaid=k=>!!(PRICES[k]||UNLOCKS[k]);
const TEAM_SHARE=5;   // what everyone else gets when a teammate finds something
const SLOT_LISTS={top:TOPS,bot:BOTTOMS,shoe:SHOES,pat:PATTERNS,x:EXTRAS,ride:RIDES};
// found: names in your Townpedia; stats: progress towards the earned items
const Wallet={coins:0,owned:[],found:[],at:0,stats:{finds:0,quick:0,tricks:0,gold:0,friends:0,hard:0,days:[]}};
const cleanStats=d=>{d=d&&typeof d==='object'?d:{};const n=v=>clamp(Math.floor(+v||0),0,1e6);
  return {finds:n(d.finds),quick:n(d.quick),tricks:n(d.tricks),gold:n(d.gold),friends:n(d.friends),hard:n(d.hard),days:(Array.isArray(d.days)?d.days:[]).filter(k=>typeof k==='string'&&/^\d{4}-\d\d-\d\d$/.test(k)).slice(-400)};};
try{const s=JSON.parse(localStorage.getItem('wb.wallet')||'{}');
  Wallet.coins=Math.max(0,Math.floor(+s.coins||0));Wallet.owned=Array.isArray(s.owned)?s.owned.filter(isPaid):[];Wallet.stats=cleanStats(s.stats);
  Wallet.found=Array.isArray(s.found)?s.found.filter(n=>typeof n==='string').slice(0,500):[];Wallet.at=+s.at||0;}catch(e){}
const isOwned=k=>!isPaid(k)||Wallet.owned.includes(k);
const tierOf=k=>{if(UNLOCKS[k])return 'earn';const p=PRICES[k]||0;return p>=240?'legend':p>=120?'fancy':p?'nice':'basic';};
const TIER_NAMES={basic:'Starter',nice:'Nice',fancy:'Fancy',legend:'Legendary',earn:'Earned'};
/* ---------- progress, and the earned items it unlocks ---------- */
function statOf(goal){const s=Wallet.stats;if(goal==='days')return s.days.length;if(goal==='finds')return Math.max(s.finds,lbMe().finds);return s[goal]||0;}
function bumpStat(goal,n){if(goal==='days')return;Wallet.stats[goal]=(Wallet.stats[goal]||0)+(n||1);walletSave();checkUnlocks();}
function checkUnlocks(){
  for(const [k,u] of Object.entries(UNLOCKS)){
    if(Wallet.owned.includes(k)||statOf(u.goal)<u.n)continue;
    Wallet.owned.push(k);walletSave();
    sfx.fanfare();toast(`🏆 Unlocked: ${itemName(k)}!`+String.fromCharCode(10)+'It’s in your wardrobe now',3200);
    sys(`🏆 You unlocked ${itemInfo(k).emoji} ${itemName(k)} (${u.text.toLowerCase()}). Wear it from 👕 Outfit.`);
  }
}
function itemInfo(k){const [slot,id]=k.split(':');const it=(SLOT_LISTS[slot]||[]).find(o=>o[0]===id)||[id,id,''];return {slot,id,name:it[1],emoji:it[2]||''};}
function itemName(k){const i=itemInfo(k);return i.slot==='pat'?`${i.name} pattern`:i.name;}
// coins for a find: a third of its points (so faster finds, fewer hints and harder games pay more)
function coinsFor(pts){return Math.ceil(Math.max(0,pts)/3);}
// the outfit with k put on (a pattern goes on the top)
function withItem(f,k){
  const {slot,id}=itemInfo(k);f=Object.assign({},f);
  if(slot==='top')f.t=id;else if(slot==='bot')f.b=id;else if(slot==='shoe')f.s=id;else if(slot==='x')f.x=id;else if(slot==='ride')f.r=id;
  else if(slot==='pat'){f.tp=id;if(f.t==='none')f.t='tee';}
  return f;
}
// swap anything you don't own for a starter piece
function ownFit(f){
  f=safeFit(f);
  if(!isOwned('top:'+f.t))f.t='tee';
  if(!isOwned('bot:'+f.b))f.b='shorts';
  if(!isOwned('pat:'+f.tp))f.tp='solid';
  if(!isOwned('pat:'+f.bp))f.bp='solid';
  if(!isOwned('shoe:'+f.s))f.s='plain';
  if(!isOwned('x:'+f.x))f.x='none';
  if(!isOwned('ride:'+f.r))f.r='board';
  return f;
}
function walletStore(){try{localStorage.setItem('wb.wallet',JSON.stringify(Wallet));}catch(e){}}
function walletSave(){Wallet.at=Date.now();walletStore();walletPush();renderCoins();}
function earn(n){if(!(n>0))return;Wallet.coins+=n;walletSave();coinPop('+'+n);}
function buy(k){
  const p=PRICES[k];if(!p||isOwned(k)||Wallet.coins<p)return false;
  Wallet.coins-=p;Wallet.owned.push(k);walletSave();sfx.chime();return true;
}
// the db copy may come from another device: keep everything owned anywhere, and the newer balance
function walletMerge(d){
  if(!d||typeof d!=='object')return;
  const theirs=(Array.isArray(d.owned)?d.owned:[]).filter(k=>isPaid(k)&&!Wallet.owned.includes(k));
  // progress: the most either copy has made
  const st=cleanStats(d.stats),my=Wallet.stats;for(const k of ['finds','quick','tricks','gold','friends','hard'])my[k]=Math.max(my[k],st[k]);
  for(const k of st.days)if(!my.days.includes(k))my.days.push(k);
  Wallet.owned.push(...theirs);
  for(const n of (Array.isArray(d.found)?d.found:[]))if(typeof n==='string'&&!Wallet.found.includes(n)&&Wallet.found.length<500)Wallet.found.push(n);
  if((+d.at||0)>Wallet.at){Wallet.coins=Math.max(0,Math.floor(+d.coins||0));Wallet.at=+d.at;}
  walletStore();renderCoins();if(myCode)checkUnlocks();if(!$('#title').hidden)renderSetup();
}
function renderCoins(){for(const el of document.querySelectorAll('.coinsN'))el.textContent=Wallet.coins;}
function coinPop(text){
  const el=$('#coinPop');if(!el)return;el.textContent=text;
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
}
// a game you played to the end: progress for the earned items, and the daily challenge's bonus
const DAILY_BONUS=30;
function gameDone(){
  const st=Wallet.stats;
  if(players().length>=2)st.friends++;
  if(!G.hs&&!G.daily&&G.diff==='hard'&&G.finds.length&&G.found>=G.finds.length/2)st.hard++;
  if(G.daily&&!st.days.includes(G.daily)){st.days.push(G.daily);Wallet.coins+=DAILY_BONUS;seen.earned=(seen.earned||0)+DAILY_BONUS;coinPop('+'+DAILY_BONUS);
    sys(`📅 Daily challenge done! Here’s 🪙 ${DAILY_BONUS}. Come back tomorrow for a new one.`);}
  walletSave();checkUnlocks();renderDailyBoards();
}
/* ---------- Townpedia: everything you've found, and a bonus every 20 ---------- */
const PEDIA_STEP=20,PEDIA_BONUS=40;
function pediaAdd(name){
  if(!name||Wallet.found.includes(name)||!W.list.some(o=>o.p&&o.n===name))return;
  Wallet.found.push(name);
  const n=Wallet.found.length;
  if(n%PEDIA_STEP===0){Wallet.coins+=PEDIA_BONUS;sys(`📖 Townpedia: ${n} things found! Here’s 🪙 ${PEDIA_BONUS}.`);coinPop('+'+PEDIA_BONUS);}
  else sys(`📖 New in your Townpedia: ${name} (${n} found).`);
  walletSave();
}
