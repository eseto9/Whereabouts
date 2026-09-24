/* =========================================================
   Wallet & shop: coins for finding things (more for finding
   them fast), spent on clothes. Per player: this browser, plus
   your private corner of the db when the artifact has one.
   ========================================================= */
// everything not listed here is part of the free starter wardrobe
const PRICES={
  'top:sweater':60,'top:raincoat':120,'top:tux':300,'top:cape':400,
  'bot:skirt':60,'bot:tutu':180,
  'shoe:boots':90,'shoe:flippers':140,'shoe:rollers':260,
  'pat:dots':50,'pat:checks':70,'pat:stars':150,'pat:rainbow':320,
  'x:scarf':40,'x:bowtie':60,'x:glasses':80,'x:backpack':100,'x:floatie':150,'x:balloon':180,'x:wings':350,'x:medal':600,
};
const TEAM_SHARE=5;   // what everyone else gets when a teammate finds something
const SLOT_LISTS={top:TOPS,bot:BOTTOMS,shoe:SHOES,pat:PATTERNS,x:EXTRAS};
const Wallet={coins:0,owned:[],found:[],at:0};   // found: names in your Townpedia
try{const s=JSON.parse(localStorage.getItem('wb.wallet')||'{}');
  Wallet.coins=Math.max(0,Math.floor(+s.coins||0));Wallet.owned=Array.isArray(s.owned)?s.owned.filter(k=>PRICES[k]):[];
  Wallet.found=Array.isArray(s.found)?s.found.filter(n=>typeof n==='string').slice(0,500):[];Wallet.at=+s.at||0;}catch(e){}
const isOwned=k=>!PRICES[k]||Wallet.owned.includes(k);
const tierOf=k=>{const p=PRICES[k]||0;return p>=300?'legend':p>=150?'fancy':p?'nice':'basic';};
const TIER_NAMES={basic:'Starter',nice:'Nice',fancy:'Fancy',legend:'Legendary'};
function itemInfo(k){const [slot,id]=k.split(':');const it=(SLOT_LISTS[slot]||[]).find(o=>o[0]===id)||[id,id,''];return {slot,id,name:it[1],emoji:it[2]||''};}
function itemName(k){const i=itemInfo(k);return i.slot==='pat'?`${i.name} pattern`:i.name;}
// 10 coins for a find, plus up to 25 more for speed (all of it within 5 s, none after a minute)
function coinsFor(ms,mult){return Math.round((10+25*clamp((60000-ms)/55000,0,1))*(mult||1));}
// the outfit with k put on (a pattern goes on the top)
function withItem(f,k){
  const {slot,id}=itemInfo(k);f=Object.assign({},f);
  if(slot==='top')f.t=id;else if(slot==='bot')f.b=id;else if(slot==='shoe')f.s=id;else if(slot==='x')f.x=id;
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
  const theirs=(Array.isArray(d.owned)?d.owned:[]).filter(k=>PRICES[k]&&!Wallet.owned.includes(k));
  Wallet.owned.push(...theirs);
  for(const n of (Array.isArray(d.found)?d.found:[]))if(typeof n==='string'&&!Wallet.found.includes(n)&&Wallet.found.length<500)Wallet.found.push(n);
  if((+d.at||0)>Wallet.at){Wallet.coins=Math.max(0,Math.floor(+d.coins||0));Wallet.at=+d.at;}
  walletStore();renderCoins();if(!$('#title').hidden)renderSetup();
}
function renderCoins(){for(const el of document.querySelectorAll('.coinsN'))el.textContent=Wallet.coins;}
function coinPop(text){
  const el=$('#coinPop');if(!el)return;el.textContent=text;
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');
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
