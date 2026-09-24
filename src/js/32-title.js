/* =========================================================
   Title screen: your name, your wardrobe and the shop
   ========================================================= */
{const wm=$('.wordmark');'Whereabouts'.split('').forEach((ch,i)=>{const s=document.createElement('span');s.textContent=ch;s.style.animationDelay=(i*0.05)+'s';s.setAttribute('aria-hidden','true');wm.appendChild(s);});}
try{const s=JSON.parse(localStorage.getItem('wb.me')||'{}');if(s.name)$('#nameIn').value=clean(s.name);if(BEAN_COLORS.includes(s.col))myCol=s.col;if(s.fit)myFit=ownFit(s.fit);}catch(e){}
const Setup={tab:'wear',trial:null};   // trial: a shop item being tried on (not bought)
let noteT=null;
function setupNote(t){const el=$('#setupNote');el.textContent=t;clearTimeout(noteT);noteT=setTimeout(()=>{el.textContent='';},4500);}

/* ---------- wardrobe: only what you own ---------- */
function optRow(el,list,slot,cur,onPick){
  el.textContent='';
  list.filter(([k])=>isOwned(slot+':'+k)).forEach(([k,l,e])=>{
    const b=document.createElement('button');b.className='opt';b.textContent=(e?e+' ':'')+l;b.setAttribute('aria-pressed',k===cur);
    b.onclick=()=>{onPick(k);renderSetup();};el.appendChild(b);
  });
  if(list.some(([k])=>!isOwned(slot+':'+k))){
    const m=document.createElement('button');m.className='opt more';m.textContent='🛍️ More';m.setAttribute('aria-label','More in the shop');
    m.onclick=()=>showTab('shop',slot);el.appendChild(m);
  }
}
function patSwatch(k,col){
  const s=document.createElement('span');s.className='patsw';s.dataset.p=k;
  s.style.setProperty('--pc',col);s.style.setProperty('--pa',patAlt(col));if(k==='stars')s.textContent='★';return s;
}
// cloth colors, then (for tops and bottoms) your patterns, drawn in that color
function toneRow(el,what,cur,onPick,pat,onPat){
  el.textContent='';
  CLOTH_COLORS.forEach((c,i)=>{const b=document.createElement('button');b.className='sw sm';b.style.background=c;b.setAttribute('aria-label',what+' color '+c);b.setAttribute('aria-pressed',i===cur);b.onclick=()=>{onPick(i);renderSetup();};el.appendChild(b);});
  if(!onPat)return;
  const gap=document.createElement('span');gap.className='gap';el.appendChild(gap);
  PATTERNS.filter(([k])=>isOwned('pat:'+k)).forEach(([k,l])=>{
    const b=document.createElement('button');b.className='pat';b.appendChild(patSwatch(k,CLOTH_COLORS[cur]));
    b.title=l;b.setAttribute('aria-label',`${what} pattern: ${l}`);b.setAttribute('aria-pressed',k===pat);
    b.onclick=()=>{onPat(k);renderSetup();};el.appendChild(b);
  });
}
function renderWear(){
  const sw=$('#swatches');sw.textContent='';
  BEAN_COLORS.forEach(c=>{const b=document.createElement('button');b.className='sw';b.style.background=c;b.setAttribute('aria-label','Color '+c);b.setAttribute('aria-pressed',c===myCol);b.onclick=()=>{myCol=c;renderSetup();};sw.appendChild(b);});
  optRow($('#topOpts'),TOPS,'top',myFit.t,k=>{myFit.t=k;});
  toneRow($('#topTone'),'Top',myFit.tc,i=>{myFit.tc=i;},myFit.tp,k=>{myFit.tp=k;});$('#topTone').hidden=myFit.t==='none';
  optRow($('#botOpts'),BOTTOMS,'bot',myFit.b,k=>{myFit.b=k;});
  toneRow($('#botTone'),'Bottoms',myFit.bc,i=>{myFit.bc=i;},myFit.bp,k=>{myFit.bp=k;});$('#botTone').hidden=myFit.b==='none';
  optRow($('#shoeOpts'),SHOES,'shoe',myFit.s,k=>{myFit.s=k;});
  toneRow($('#shoeTone'),'Shoe',myFit.sc,i=>{myFit.sc=i;});
  optRow($('#xOpts'),EXTRAS,'x',myFit.x,k=>{myFit.x=k;});
}

/* ---------- shop: everything that costs coins ---------- */
const SHOP_SECTIONS=[['top','Tops'],['bot','Bottoms'],['shoe','Shoes'],['pat','Patterns'],['x','Extras']];
const wearing=k=>{const {slot,id}=itemInfo(k);return slot==='top'?myFit.t===id:slot==='bot'?myFit.b===id:slot==='shoe'?myFit.s===id:slot==='x'?myFit.x===id:myFit.tp===id||myFit.bp===id;};
function renderShop(){
  const list=$('#shopList');list.textContent='';
  for(const [slot,title] of SHOP_SECTIONS){
    const keys=Object.keys(PRICES).filter(k=>k.startsWith(slot+':')).sort((a,b)=>PRICES[a]-PRICES[b]);
    const sec=document.createElement('section');sec.id='shop-'+slot;
    const h=document.createElement('h3');h.textContent=title;sec.appendChild(h);
    const grid=document.createElement('div');grid.className='cards';
    for(const k of keys){
      const it=itemInfo(k),tier=tierOf(k),owned=isOwned(k),price=PRICES[k];
      const card=document.createElement('div');card.className=`card tier-${tier}`+(Setup.trial===k?' trying':'');
      const art=document.createElement('button');art.className='art';art.setAttribute('aria-label',`Try on ${itemName(k)}`);
      if(slot==='pat')art.appendChild(patSwatch(it.id,CLOTH_COLORS[myFit.tc]));else art.textContent=it.emoji;
      art.onclick=()=>{Setup.trial=Setup.trial===k?null:k;renderSetup();};
      const nm=document.createElement('b');nm.textContent=it.name;
      const tl=document.createElement('small');tl.textContent=TIER_NAMES[tier];
      const act=document.createElement('button');act.className='btn buy';
      if(owned){act.textContent=wearing(k)?'Wearing ✓':'Wear';act.disabled=wearing(k);act.onclick=()=>{myFit=withItem(myFit,k);Setup.trial=null;renderSetup();};}
      else{
        act.textContent=`🪙 ${price}`;const short=price-Wallet.coins;
        act.disabled=short>0;act.title=short>0?`You need ${short} more coins`:`Buy ${itemName(k)}`;
        act.setAttribute('aria-label',short>0?`${itemName(k)}, ${price} coins. You need ${short} more`:`Buy ${itemName(k)} for ${price} coins`);
        act.onclick=()=>{if(buy(k)){myFit=withItem(myFit,k);Setup.trial=null;saveMe();setupNote(`🎉 You bought ${itemName(k)}! It’s in your wardrobe now.`);renderSetup();}};
      }
      card.append(art,nm,tl,act);grid.appendChild(card);
    }
    sec.appendChild(grid);list.appendChild(sec);
  }
}
function renderSetup(){
  for(const [t,btn] of [['wear',$('#tabWear')],['shop',$('#tabShop')],['pedia',$('#tabPedia')]])btn.setAttribute('aria-selected',Setup.tab===t);
  $('#wearView').hidden=Setup.tab!=='wear';$('#shopView').hidden=Setup.tab!=='shop';$('#pediaView').hidden=Setup.tab!=='pedia';
  if(Setup.tab!=='shop')Setup.trial=null;
  if(Setup.tab==='wear')renderWear();else if(Setup.tab==='shop')renderShop();else renderPedia();
  renderCoins();
  const tn=$('#tryNote');
  tn.textContent=Setup.trial?`Trying on ${itemName(Setup.trial)}${isOwned(Setup.trial)?'':` (🪙 ${PRICES[Setup.trial]})`}`:'';
  Prev.dress();
}
function showTab(tab,slot){
  Setup.tab=tab;Setup.trial=null;renderSetup();
  if(slot){const s=$('#shop-'+slot);if(s)s.scrollIntoView({block:'nearest',behavior:'smooth'});}
}
$('#tabWear').addEventListener('click',()=>showTab('wear'));
$('#tabShop').addEventListener('click',()=>showTab('shop'));
$('#tabPedia').addEventListener('click',()=>showTab('pedia'));

/* ---------- Townpedia: a page for every findable thing ---------- */
const AREA_NAMES={square:'Town Square',market:'Market Street',harbor:'Harbor',hill:'Hillside',park:'Park',farm:'Farm',orchard:'Orchard',sea:'At sea',sky:'In the sky'};
const firstGlyph=s=>{s=s||'';try{if(window.Intl&&Intl.Segmenter)return [...new Intl.Segmenter().segment(s)][0]?.segment||'';}catch(e){}return Array.from(s)[0]||'';};
function areaOf(o){if(!o.area){const c=objCenter(o);o.area=districtAt(c.x,c.y,c.z);}return o.area;}
function renderPedia(){
  const all=W.list.filter(o=>o.p),found=new Set(Wallet.found);
  const have=all.filter(o=>found.has(o.n)).length;
  $('#pediaCount').textContent=`${have} of ${all.length} found. Every ${PEDIA_STEP} new finds earns 🪙 ${PEDIA_BONUS}.`;
  const areas=['all',...Object.keys(AREA_NAMES).filter(a=>all.some(o=>areaOf(o)===a))];
  if(!areas.includes(Setup.area))Setup.area='all';
  const chips=$('#pediaAreas');chips.textContent='';
  for(const a of areas){const n=all.filter(o=>a==='all'||areaOf(o)===a),h=n.filter(o=>found.has(o.n)).length;
    const b=document.createElement('button');b.className='chip';b.textContent=`${a==='all'?'All':AREA_NAMES[a]} ${h}/${n.length}`;b.setAttribute('aria-pressed',Setup.area===a);
    b.onclick=()=>{Setup.area=a;renderPedia();};chips.appendChild(b);}
  const list=$('#pediaList');list.textContent='';
  for(const o of all.filter(o=>Setup.area==='all'||areaOf(o)===Setup.area).sort((a,b)=>(found.has(b.n)-found.has(a.n))||a.n.localeCompare(b.n))){
    const got=found.has(o.n),d=document.createElement('div');d.className='pcard'+(got?'':' unknown');
    const i=document.createElement('span');i.className='pic';i.textContent=got?firstGlyph(o.e)||'⭐':'❓';
    const n=document.createElement('b');n.textContent=got?o.n.charAt(0).toUpperCase()+o.n.slice(1):'???';
    const a=document.createElement('small');a.textContent=AREA_NAMES[areaOf(o)]||'';
    d.append(i,n,a);list.appendChild(d);
  }
}
// a random outfit from what you own
function surprise(){
  const pickOwn=(list,slot,skipNone)=>pick(list.filter(([k])=>isOwned(slot+':'+k)&&!(skipNone&&k==='none')))[0];
  const ci=()=>Math.floor(Math.random()*CLOTH_COLORS.length);
  const pat=()=>Math.random()<0.55?'solid':pickOwn(PATTERNS,'pat');
  myCol=pick(BEAN_COLORS);
  myFit={t:pickOwn(TOPS,'top',true),tc:ci(),tp:pat(),b:pickOwn(BOTTOMS,'bot',true),bc:ci(),bp:pat(),s:pickOwn(SHOES,'shoe'),sc:ci(),x:Math.random()<0.35?'none':pickOwn(EXTRAS,'x')};
  Setup.tab='wear';sfx.pop();renderSetup();
}
$('#surpriseBtn').addEventListener('click',()=>{audioInit();surprise();});
function saveMe(){try{localStorage.setItem('wb.me',JSON.stringify({name:myName||clean($('#nameIn').value),col:myCol,fit:myFit}));}catch(e){}}
// the wardrobe is the title screen again, over the game, with a Done button
function openWardrobe(tab){
  if(locked)document.exitPointerLock();
  Setup.tab=tab==='shop'?'shop':'wear';
  $('#title').classList.add('wardrobe');$('#title').hidden=false;renderSetup();
  setTimeout(()=>$('#doneBtn').focus(),30);
}
function closeWardrobe(){
  $('#title').hidden=true;$('#title').classList.remove('wardrobe');Setup.trial=null;
  myName=clean($('#nameIn').value)||myName;myFit=ownFit(myFit);saveMe();
  if(P.bean){scene.remove(P.bean);P.bean=makeBean(myCol,myFit,myName);P.bean.userData.tag.visible=false;P.bean.position.copy(P.pos);}
  presence({name:myName,col:myCol,fit:Object.assign({},myFit)});
  renderAll();canvas.focus();
}
$('#wardrobeBtn').addEventListener('click',()=>openWardrobe('wear'));
$('#coinBtn').addEventListener('click',()=>openWardrobe('shop'));
$('#doneBtn').addEventListener('click',closeWardrobe);

// Live 3D preview of your Wanderbean (its own little renderer); shows a shop item you're trying on
const Prev={r:null,scene:new THREE.Scene(),cam:new THREE.PerspectiveCamera(26,150/210,0.1,50),bean:null,running:false,
  dress(){
    if(!this.r)return;
    if(this.bean)this.scene.remove(this.bean);
    this.bean=makeBean(myCol,Setup.trial?withItem(myFit,Setup.trial):myFit,'',this.scene);this.bean.userData.tag.visible=false;
    this.start();
  },
  start(){if(this.running||!this.r)return;this.running=true;requestAnimationFrame(t=>this.frame(t));},
  frame(now){
    if($('#title').hidden){this.running=false;return;}
    requestAnimationFrame(t=>this.frame(t));
    const ts=now/1000;
    this.bean.rotation.y=Math.sin(ts*0.7)*0.9;
    animBean(this.bean,{an:0},ts);
    this.r.render(this.scene,this.cam);
  },
};
try{
  Prev.r=new THREE.WebGLRenderer({canvas:$('#beanPrev'),antialias:true,alpha:true});
  Prev.r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));Prev.r.setSize(150,210,false);
  Prev.scene.add(new THREE.HemisphereLight(0xCFE2FF,0xF6B98C,0.8));
  const l=new THREE.DirectionalLight(0xFFE0B0,1.0);l.position.set(-2,3,4);Prev.scene.add(l);
  Prev.cam.position.set(0,1.45,7);Prev.cam.lookAt(0,1.12,0);
}catch(e){Prev.r=null;$('#beanPrev').hidden=true;}
renderSetup();

function genCode(){const A='ABCDEFGHJKMNPQRSTUVWXYZ';let s='';for(let i=0;i<4;i++)s+=A[Math.floor(Math.random()*A.length)];return s;}
function joinRoom(code,fresh){
  audioInit();
  myName=clean($('#nameIn').value)||'Bean '+Math.floor(Math.random()*90+10);
  Setup.trial=null;myFit=ownFit(myFit);saveMe();
  myCode=code;G=freshState();G._recv=Date.now();wasHost=false;
  Net.myPres={code,name:myName,col:myCol,fit:Object.assign({},myFit),joinedAt:Date.now()};
  if(Net.room)Net.room.presence(Net.myPres).catch(()=>{});
  if(P.bean)scene.remove(P.bean);
  P.bean=makeBean(myCol,myFit,myName);P.bean.userData.tag.visible=false;
  P.pos.set(sr(-3,3),0,sr(5,8));P.pos.y=groundY(P.pos.x,P.pos.z);P.yaw=Math.PI;P.face=Math.PI;
  $('#title').hidden=true;$('#hud').hidden=false;
  sys(Net.room?`You’re in room ${code}. Share the code so friends can join.`:`Playing solo in room ${code}.`);
  sys('Find things to earn 🪙 coins (faster finds earn more), then spend them at the Bean Boutique in Market Street.');
  sendPresence(true);renderAll();tryLock();
  roomDocWatch(code);if(fresh)roomDocPrune();
  if(Net.web)setTimeout(()=>{if(myCode===code&&Net.room.status()!=='online')sys('Can’t reach the online server right now, so this room is solo. Try again in a minute.');},12000);
}
$('#createBtn').addEventListener('click',()=>joinRoom(genCode(),true));
$('#joinBtn').addEventListener('click',()=>{const c=clean($('#codeIn').value,4).toUpperCase();if(!/^[A-Z]{4}$/.test(c)){$('#netNote').textContent='Room codes are 4 letters, like KMPX.';$('#netNote').classList.add('err');$('#codeIn').focus();return;}joinRoom(c);});
$('#codeIn').addEventListener('keydown',e=>{if(e.key==='Enter')$('#joinBtn').click();});
$('#codeIn').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z]/g,'');});

/* ---------- invites: a link with the room code in it ---------- */
function inviteLink(){if(!Net.web)return '';const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('room',myCode);return u.toString();}
$('#inviteBtn').addEventListener('click',async()=>{
  if(!myCode)return;
  const url=inviteLink(),text=url?`Come play Whereabouts with me! Tap to join my room (${myCode}):`:`Come play Whereabouts with me! My room code is ${myCode}.`;
  try{if(navigator.share){await navigator.share(url?{title:'Whereabouts',text,url}:{title:'Whereabouts',text});return;}}catch(e){if(e&&e.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(url?`${text} ${url}`:text);toast('Invite copied!'+String.fromCharCode(10)+'Paste it to a friend',1800);}
  catch(e){sys(url?`Send your friends this link: ${url}`:`Tell your friends your room code: ${myCode}`);}
});
// opened from an invite: fill in the code and point at Join
{const q=new URLSearchParams(location.search).get('room');
 if(q&&/^[A-Za-z]{4}$/.test(q)){const c=q.toUpperCase();$('#codeIn').value=c;
   const n=$('#inviteNote');n.hidden=false;n.textContent=`🎉 You’re invited to room ${c}! Pick your look, then tap Join.`;$('#joinBtn').classList.add('pulse');
   $('#joinBtn').addEventListener('click',()=>{try{history.replaceState(null,'',location.pathname);}catch(e){}},{once:true});}}

/* ---------- graphics setting (applies when the page reloads) ---------- */
function renderGfx(){for(const b of $('#gfxSeg').children)b.setAttribute('aria-pressed',b.dataset.q===GFX.q);}
$('#gfxSeg').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||b.dataset.q===GFX.q)return;
  try{localStorage.setItem('wb.gfx',b.dataset.q);}catch(err){}
  if(myCode){GFX.q=b.dataset.q;renderGfx();setupNote('Graphics will change next time you open the game.');}
  else location.reload();
});
renderGfx();
