/* =========================================================
   UI
   ========================================================= */
const compassEl=$('#compass');
const CM=[['N',0,-1e5],['E',1e5,0],['S',0,1e5],['W',-1e5,0],['⛲',0,0],['🛒',40,0],['⚓',0,55],['🏡',0,-43],['🌳',-38,6]].map(([t,x,z])=>{const e=document.createElement('span');e.className='tick';e.textContent=t;compassEl.appendChild(e);return {e,x,z};});
const dotEls=new Map();
function compassX(x,z){const b=Math.atan2(x-P.pos.x,z-P.pos.z);let d=((b-P.yaw+Math.PI)%TAU+TAU)%TAU-Math.PI;return d;}
function updateCompass(){
  const W2=compassEl.clientWidth/2||150,k=W2/1.25;
  const place=(el,x,z)=>{const d=compassX(x,z);if(Math.abs(d)>1.25){el.style.display='none';return;}el.style.display='';el.style.left=(W2-d*k)+'px';};
  for(const m of CM)place(m.e,m.x,m.z);
  const seen=new Set();
  for(const [peer,r] of Remote){seen.add(peer);let el=dotEls.get(peer);if(!el){el=document.createElement('span');el.className='dot';compassEl.appendChild(el);dotEls.set(peer,el);}
    el.style.background=r.bean.userData.col;place(el,r.bean.position.x,r.bean.position.z);}
  for(const [peer,el] of dotEls){if(!seen.has(peer)){el.remove();dotEls.delete(peer);}}
  for(const p of pings)place(p.el,p.x,p.z);
}
let toastT=null;
function toast(msg,ms){const el=$('#toast');el.textContent=msg;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('on'),ms||1800);}
function addChat(name,col,text,spy){
  const log=$('#chatLog');const d=document.createElement('div');
  const b=document.createElement('b');b.textContent=name+': ';b.style.color=col;d.appendChild(b);
  const s=document.createElement('span');s.textContent=text;if(spy)s.className='spyline';d.appendChild(s);
  log.appendChild(d);while(log.children.length>60)log.firstChild.remove();log.scrollTop=log.scrollHeight;
  chatPeek();
}
function sys(text){const log=$('#chatLog');const d=document.createElement('div');d.className='sys';d.textContent=text;log.appendChild(d);while(log.children.length>60)log.firstChild.remove();log.scrollTop=log.scrollHeight;}
const fmtT=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};

function renderPlayers(){
  const ul=$('#plist');ul.textContent='';const hp=hostPeer();
  for(const p of sortedPlayers()){
    const li=document.createElement('li');const sw=document.createElement('span');sw.className='sw2';sw.style.background=safeCol(p.presence.col);li.appendChild(sw);
    const n=document.createElement('span');n.textContent=(clean(p.presence.name)||'Bean')+(p.sameTab?' (you)':'');li.appendChild(n);
    const tags=[];if(p.peer===hp)tags.push('👑');if(p.peer===G.spy&&(G.phase==='pick'||G.phase==='clue'))tags.push('🕵️');
    if(tags.length){const t=document.createElement('span');t.textContent=tags.join(' ');t.title=(p.peer===hp?'Host':'')+(tags.length>1?' and Spy':p.peer!==hp?'Spy':'');li.appendChild(t);}
    ul.appendChild(li);
  }
}
const seen={phase:null,r:-1,n:0,revealId:null};
function renderAll(){
  const me=myPeer();const isSpy=G.spy===me;
  // transitions
  if(G.r!==seen.r){clearSpy();setRevealHighlight(null);if(G.phase==='clue'){sfx.clue();toast(G.kind==='player'?`New clue from ${G.spyName}!`:'New clue!',1400);}}
  if(G.phase==='pick'&&(seen.phase!=='pick'||G.r!==seen.r)){if(isSpy){sfx.spy();toast('You’re the Spy!\nClick something to pick it.',2600);}}
  if(G.phase==='clue'&&seen.phase==='pick'&&G.r===seen.r){sfx.clue();toast(`${G.spyName} spies something…`,1500);}
  if(G.phase==='clue'&&G.r===seen.r&&G.lines.length>seen.n&&seen.phase==='clue')sfx.hint();
  if(G.phase==='reveal'&&seen.phase!=='reveal'){if(G.reveal&&!G.reveal.found){sfx.sad();toast('Time’s up!',1600);}}
  const rid=G.phase==='reveal'&&G.reveal?G.reveal.id:null;
  if(rid!==seen.revealId)setRevealHighlight(rid);
  if(G.phase==='reveal'&&G.reveal&&!G.reveal.found&&G.reveal.id==null&&isSpy&&Spy.r===G.r&&Spy.target!=null&&!seen.spySent){seen.spySent=true;emit('wb.result',{r:G.r,reveal:true,id:Spy.target});}
  if(G.phase==='recap'&&seen.phase!=='recap'){sfx.fanfare();if(G.found)burst(new V3(P.pos.x,P.pos.y+2,P.pos.z),140);}
  if(G.phase==='reveal'&&G.reveal&&G.reveal.found&&(G.streak||0)>=2&&G.streak!==seen.streak)setTimeout(()=>toast(`🔥 ${G.streak} in a row!`,1500),1300);
  // coins: the finder gets paid for speed, everyone else who was hunting gets a small share
  if(G.phase==='reveal'&&G.reveal&&G.reveal.found&&seen.played&&seen.paidR!==G.r){
    seen.paidR=G.r;const mine=G.reveal.gp===myPeer();const c=mine?G.reveal.coins:TEAM_SHARE;
    earn(c);seen.earned=(seen.earned||0)+c;
    sys(mine?`You earned 🪙 ${c} for finding it in ${G.reveal.secs}s.`:`You earned 🪙 ${c} as your team’s share.`);
  }
  if(G.phase==='clue'||G.phase==='pick')seen.played=true;else if(G.phase==='lobby'){seen.played=false;seen.earned=0;}
  const newHints=G.phase==='clue'&&G.r===seen.r?Math.max(0,G.lines.length-seen.n):0;
  if(G.r!==seen.r)seen.spySent=false;
  Object.assign(seen,{phase:G.phase,r:G.r,n:G.lines.length,revealId:rid,streak:G.streak});

  // HUD
  $('#roomCode').textContent=myCode||'----';
  $('#score').textContent=G.score||0;
  $('#streakN').textContent=(G.streak||0)>=2?'🔥'+G.streak:(G.streak||'–');
  $('#clueNum').textContent=(G.phase==='lobby')?'–':(G.phase==='recap'?`${G.total}/${G.total}`:`${Math.min(G.idx+1,G.total)}/${G.total}`);
  // clue card
  const card=$('#clue'),inPlay=G.phase==='pick'||G.phase==='clue'||G.phase==='reveal';
  card.hidden=!inPlay;if(G.r!==seen.cardR){card.classList.remove('open');seen.cardR=G.r;}
  if(inPlay){
    const ph=$('#cluePhase'),mn=$('#clueMain'),ul=$('#clueHints');ul.textContent='';
    if(G.phase==='pick'){ph.textContent=`Clue ${G.idx+1} of ${G.total}`;mn.textContent=isSpy?'You’re the Spy! Aim at anything and click to pick it.':`${G.spyName} is picking something to spy…`;}
    else if(G.phase==='clue'){ph.textContent=G.kind==='player'?`Clue ${G.idx+1} of ${G.total}, spied by ${G.spyName}`:`Clue ${G.idx+1} of ${G.total}`;mn.textContent=G.lines[0]||'';
      G.lines.slice(1).forEach((l,i,arr)=>{const li=document.createElement('li');li.textContent=l;if(i>=arr.length-newHints)li.className='new';ul.appendChild(li);});}
    else{ph.textContent=`Clue ${G.idx+1} of ${G.total}`;const r=G.reveal||{};
      mn.textContent=r.found?`${r.by} found it! +${r.pts}`:'Nobody found it this time.';
      const li=document.createElement('li');li.textContent=r.name?`It was ${r.name}.`:'The Spy is revealing it…';ul.appendChild(li);
      if(r.found&&Array.isArray(r.bonus)&&r.bonus.length){const lb=document.createElement('li');lb.className='bonus';lb.textContent=r.bonus.join(' · ');ul.appendChild(lb);}
      if(r.found&&r.coins){const lc=document.createElement('li');lc.className='bonus';lc.textContent=`Found in ${r.secs}s · 🪙 +${r.coins} for ${r.by||'the finder'}, +${TEAM_SHARE} for everyone else`;ul.appendChild(lc);}}
    renderPips();
    // phones show the clue and the newest hint; the rest are a tap away
    card.dataset.phase=G.phase;
    const hidden=touchMode&&!card.classList.contains('open')?Math.max(0,ul.children.length-1):0;
    const more=$('#clueMore');more.hidden=!touchMode||ul.children.length<2;
    more.textContent=hidden?`▾ ${hidden} more ${G.phase==='clue'?(hidden>1?'hints':'hint'):'details'}`:'▴ Show less';
  }
  // lobby
  const lob=$('#lobby');lob.hidden=G.phase!=='lobby';
  if(G.phase==='lobby'){
    const host=amHost();const n=players().length;
    $('#lobbyMsg').textContent=host?(n>1?`You’re the host. ${n} beans are here. Start whenever you’re ready.`:'You’re the host. Share your room code, or start solo. Click anything to learn its name.'):`Waiting for ${peerName(hostPeer())} to start. Walk around and click things to learn their names.`;
    for(const b of $('#modeSeg').children){b.setAttribute('aria-pressed',b.dataset.mode===G.mode);b.disabled=!host;}
    for(const b of $('#totalSeg').children){b.setAttribute('aria-pressed',+b.dataset.total===G.total);b.disabled=!host;}
    for(const b of $('#diffSeg').children){b.setAttribute('aria-pressed',b.dataset.diff===G.diff);b.disabled=!host;}
    for(const b of $('#huntSeg').children){b.setAttribute('aria-pressed',(b.dataset.hunt==='daily')===!!G.daily);b.disabled=!host;}
    $('#freeOpts').hidden=!!G.daily;$('#dailyOpts').hidden=!G.daily;
    if(G.daily){dailyWatch(G.daily);renderBoard($('#dailyBoard'));}
    $('#startBtn').hidden=!host;
  }
  renderSpy();renderRecap();renderPlayers();updateTip();
}
function renderPips(){
  const el=$('#pips');el.textContent='';
  if(G.phase==='clue'&&G.kind==='game'){for(let i=0;i<diffOf().lines;i++){const p=document.createElement('span');p.className='pip'+(i<G.lines.length?' on':'');el.appendChild(p);}}
  const bar=document.createElement('div');bar.className='bar';bar.appendChild(document.createElement('i'));el.appendChild(bar);
  const lab=document.createElement('small');lab.id='roundLbl';lab.style.fontWeight='900';el.appendChild(lab);
}
function updateHUDTimers(){
  const inPlay=G.phase==='pick'||G.phase==='clue'||G.phase==='reveal';
  $('#timeLeft').textContent=inPlay?fmtT(liveLeft('sessLeft')):'–';
  const bar=document.querySelector('#pips .bar i'),lab=$('#roundLbl');if(!bar||!lab)return;
  if(G.phase==='clue'&&G.kind==='game'&&G.lines.length<diffOf().lines){const h=liveLeft('hintIn');bar.style.width=(100*(1-h/diffOf().hint))+'%';lab.textContent=`next hint in ${Math.ceil(h/1000)}s`;}
  else if(G.phase==='clue'){const r=liveLeft('roundLeft');bar.style.width=(100*r/(G.kind==='game'?diffOf().round:PROUND_MS))+'%';lab.textContent=`${Math.ceil(r/1000)}s left`;}
  else if(G.phase==='pick'){const r=liveLeft('roundLeft');bar.style.width=(100*r/PICK_MS)+'%';lab.textContent=`${Math.ceil(r/1000)}s to pick`;}
  else{bar.style.width='0%';lab.textContent='';}
}
let spyHintsSent=0;
function renderSpy(focus){
  const el=$('#spy');const isSpy=G.spy===myPeer();
  const show=isSpy&&((G.phase==='pick'&&Spy.target!=null&&Spy.r===G.r)||(G.phase==='clue'&&G.kind==='player'));
  if(!show){el.hidden=true;el.dataset.mode='';return;}
  const mode=G.phase==='pick'?'write:'+Spy.target:'help:'+G.r+':'+G.lines.length;
  if(el.dataset.mode===mode&&!el.hidden)return;
  el.dataset.mode=mode;el.hidden=false;el.textContent='';
  const o=W.list[Spy.target];
  const h=document.createElement('h2'),p=document.createElement('p');el.append(h,p);
  if(G.phase==='pick'){
    h.textContent=`You picked ${o.n}`;p.textContent='Write a clue. Keep it tricky, but fair. Tap an idea to start from it.';
    const inp=document.createElement('input');inp.type='text';inp.maxLength=120;inp.value='I spy something ';inp.id='spyText';inp.setAttribute('aria-label','Your clue');
    const chips=document.createElement('div');chips.className='chips';
    const ideas=[];(o.c||[]).forEach(c=>ideas.push(`I spy something ${c}…`));if(o.v)ideas.push(`I spy something that looks ${o.v}…`);if(o.s)ideas.push(`I spy something ${o.s}…`);if(o.snd)ideas.push(`I spy something that goes “${o.snd}”…`);
    ideas.slice(0,4).forEach(t=>{const b=document.createElement('button');b.className='chip';b.textContent=t;b.onclick=()=>{inp.value=t;inp.focus();};chips.appendChild(b);});
    const row=document.createElement('div');row.className='row';
    const send=document.createElement('button');send.className='btn';send.textContent='Send clue';
    const again=document.createElement('button');again.className='btn alt';again.textContent='Pick something else';
    const go=()=>{const t=clean(inp.value,120);if(t.length<6){inp.focus();return;}emit('wb.spyclue',{r:G.r,t,mv:!!o.mv});spyHintsSent=0;send.disabled=true;};
    send.onclick=go;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});
    again.onclick=()=>{clearSpy();el.hidden=true;el.dataset.mode='';toast('Click something new',1200);tryLock();};
    row.append(send,again);el.append(inp,chips,row);
    if(focus)setTimeout(()=>{inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);},30);
  }else{
    h.textContent='You’re the Spy';p.textContent=`Your team is hunting for ${o?o.n:'your pick'}. Nudge them along.`;
    const row=document.createElement('div');row.className='row';
    [['Warmer 🔥'],['Colder 🧊'],['Yes!'],['Nope'],['So close!']].forEach(([t])=>{const b=document.createElement('button');b.className='chip';b.textContent=t;b.onclick=()=>sendChat(t,true);row.appendChild(b);});
    el.appendChild(row);
    const left=Math.max(0,3-G.lines.length);
    const hr=document.createElement('div');hr.className='row';hr.style.marginTop='10px';
    const inp=document.createElement('input');inp.type='text';inp.maxLength=100;inp.placeholder=left?`Add a hint (${left} left)`:'No hints left';inp.disabled=!left;inp.style.flex='1';inp.setAttribute('aria-label','Extra hint');
    const b=document.createElement('button');b.className='btn sea';b.textContent='Add hint';b.disabled=!left;
    const go=()=>{const t=clean(inp.value,100);if(!t)return;emit('wb.spyhint',{r:G.r,t});inp.value='';};
    b.onclick=go;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});
    hr.append(inp,b);el.appendChild(hr);
    const tip=document.createElement('p');tip.style.margin='10px 0 0';tip.style.fontSize='13px';tip.style.color='var(--muted)';tip.textContent='Hints cost your team a few points, so use them when they’re stuck.';el.appendChild(tip);
  }
}
function renderRecap(){
  const wrap=$('#recap');if(G.phase!=='recap'){wrap.hidden=true;return;}
  if(!wrap.hidden&&wrap.dataset.v===String(G.v))return;wrap.dataset.v=String(G.v);
  wrap.hidden=false;if(locked)document.exitPointerLock();
  const b=$('#recapBody');b.textContent='';
  const h=document.createElement('h2');h.textContent=G.found===G.finds.length&&G.found>0?'A perfect hunt!':'That’s a wrap!';
  const big=document.createElement('div');big.className='big';big.textContent=G.score;
  const p=document.createElement('p');p.style.fontWeight='800';p.style.margin='0';p.textContent=`Team score. You found ${G.found} of ${G.finds.length} things.`;
  const p2=document.createElement('p');p2.className='sub';p2.textContent=[G.daily?'📅 Daily hunt':DIFF[G.diff].label,G.best>=2?`🔥 Best streak: ${G.best} in a row`:'',seen.earned?`🪙 You earned ${seen.earned} coins`:''].filter(Boolean).join(' · ');
  const ul=document.createElement('ul');ul.className='finds';
  G.finds.forEach(f=>{const li=document.createElement('li');const a=document.createElement('span');a.textContent=f.n?(f.n.charAt(0).toUpperCase()+f.n.slice(1)):'A mystery';
    const pts=document.createElement('span');pts.className='pts';pts.textContent=f.p?'+'+f.p:'0';
    const q=document.createElement('span');q.className='q';q.textContent=`“${clean(f.c,110)}”${f.by?' Found by '+clean(f.by)+'.':' Not found.'}`;
    li.append(a,pts,q);ul.appendChild(li);});
  const row=document.createElement('div');row.className='row';
  if(amHost()){const again=document.createElement('button');again.className='btn';again.textContent='Play again';again.onclick=()=>{G.phase='lobby';commit();};row.appendChild(again);}
  else{const w=document.createElement('span');w.style.fontWeight='800';w.textContent=`Waiting for ${peerName(hostPeer())} to start another round.`;row.appendChild(w);}
  const lv=document.createElement('button');lv.className='btn alt';lv.textContent='Wander around';lv.onclick=()=>{wrap.hidden=true;wrap.dataset.v='x';};row.appendChild(lv);
  b.append(h,big,p,p2,ul);
  if(G.daily){
    const h3=document.createElement('h3');h3.textContent='Today’s board';b.appendChild(h3);
    if(G.dailyMsg){const m=document.createElement('p');m.className='sub';m.textContent=G.dailyMsg;b.appendChild(m);}
    const ol=document.createElement('ol');ol.className='board';ol.id='recapBoard';b.appendChild(ol);renderBoard(ol);
  }
  b.appendChild(row);
}
function updateTip(){
  const tip=$('#tip');if(!myCode){tip.hidden=true;return;}
  let t='';
  if(!locked&&!noLock)t='Click the town to look around. Press Esc to get your cursor back.';
  else if(noLock&&!locked)t=touchMode?'Drag to look around. Tap something to guess it.':'Drag to look around. Click something to guess it.';
  if(!$('#spy').hidden||!$('#recap').hidden||(!$('#lobby').hidden&&(touchMode||innerWidth<=980)))t='';
  tip.textContent=t;tip.hidden=!t;
}
$('#modeSeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!amHost()||G.phase!=='lobby')return;G.mode=b.dataset.mode;commit();});
$('#totalSeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!amHost()||G.phase!=='lobby')return;G.total=+b.dataset.total;commit();});
$('#diffSeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!amHost()||G.phase!=='lobby')return;G.diff=b.dataset.diff;commit();});
$('#huntSeg').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!amHost()||G.phase!=='lobby')return;
  G.daily=b.dataset.hunt==='daily'?todayKey():'';if(G.daily){G.mode='game';G.total=DAILY_N;G.diff='normal';}commit();});
$('#startBtn').addEventListener('click',()=>{audioInit();if(amHost()&&G.phase==='lobby'){startGame();tryLock();}});

/* binocular mask drawn to the real screen size */
function drawBinoMask(){
  const w=window.innerWidth,h=window.innerHeight,r=Math.min(w*0.27,h*0.44),cx=w/2,cy=h/2,off=r*0.78;
  $('#binoMask').innerHTML=`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path fill="#140E26" fill-rule="evenodd" d="M0 0H${w}V${h}H0Z M${cx-off-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z M${cx+off-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z"/><circle cx="${cx-off}" cy="${cy}" r="${r}" fill="none" stroke="#2B2040" stroke-width="10"/><circle cx="${cx+off}" cy="${cy}" r="${r}" fill="none" stroke="#2B2040" stroke-width="10"/></svg>`;
}

