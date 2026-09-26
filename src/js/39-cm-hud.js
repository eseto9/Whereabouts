/* =========================================================
   CROWDED MARKET — the HUD: clock, coins, your stall, what E
   will do, the event feed, the Tab summary and the recap.
   Reads the game state; player choices go back through cmAct.
   ========================================================= */
// a small element with text (never HTML, so names can't inject anything)
function cmEl(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
const cmIcon=g=>CM_TUNE.GOODS[g].icon;
const cmClock=secs=>{const s=Math.max(0,Math.ceil(secs));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const CMH={t:0,coins:{},toastT:null,keysHidden:false};

function cmToast(msg,ms){const el=$('#cmToast');el.textContent=msg;el.classList.add('on');clearTimeout(CMH.toastT);CMH.toastT=setTimeout(()=>el.classList.remove('on'),ms||1600);}
function cmFeed(text,cls){
  const log=$('#cmFeed'),d=cmEl('div',cls||'',text);log.appendChild(d);
  while(log.children.length>50)log.firstChild.remove();log.scrollTop=log.scrollHeight;
}
function cmHudReset(){
  $('#cmFeed').textContent='';$('#cmTab').hidden=true;$('#cmRecap').hidden=true;$('#cmPrompt').hidden=true;
  $('#cmClock').classList.remove('late');CMH.coins={};CMH.t=0;$('#cmScores').textContent='';
}

function cmHudRender(s,dt){
  CMH.t-=dt;if(CMH.t>0)return;CMH.t=0.1;
  const T=CM_TUNE,left=T.DAY-s.t,part=T.PARTS.find(p=>p.k===s.part);
  $('#cmPart').textContent=`${part.icon} ${part.label}`;
  $('#cmTime').textContent=cmClock(left);
  $('#cmBarFill').style.width=(100*s.t/T.DAY)+'%';
  $('#cmClock').classList.toggle('late',s.phase==='day'&&left<=30);
  // coins: you first, then everyone by coins
  const box=$('#cmScores'),rows=s.order.slice().sort((a,b)=>(a===CMG.me?-1:b===CMG.me?1:s.players[b].coins-s.players[a].coins));
  if(box.children.length!==rows.length){box.textContent='';for(const id of rows){const r=cmEl('div','cmRow'+(id===CMG.me?' me':''));r.dataset.id=id;
    const d=cmEl('span','dot');d.style.background=s.players[id].col;r.append(d,cmEl('span','nm'),cmEl('span','cn'));box.appendChild(r);}}
  for(const r of box.children){const p=s.players[r.dataset.id];r.querySelector('.nm').textContent=p.id===CMG.me?'You':p.name;
    const cn=r.querySelector('.cn');const was=CMH.coins[p.id];cn.textContent='🪙 '+p.coins;
    if(was!=null&&p.coins>was){cn.classList.remove('bump');void cn.offsetWidth;cn.classList.add('bump');}CMH.coins[p.id]=p.coins;}
  document.documentElement.style.setProperty('--cm-scores-h',box.offsetHeight+'px');
  // your stall and your arms
  const me=s.players[CMG.me],st=s.stalls[me.stall],el=$('#cmStall');el.textContent='';
  el.appendChild(cmEl('h3',null,'🧺 Your stall'));
  const g=cmEl('div','cmGoods');let any=false;
  for(const k of Object.keys(T.GOODS)){const n=st.stock[k]||0;if(!n)continue;any=true;
    g.append(cmEl('span',null,cmIcon(k)+' '+T.GOODS[k].name),cmEl('span','n','×'+n),cmEl('span','pr','🪙'+st.price[k]));}
  if(!any)g.appendChild(cmEl('span','empty','Empty! Go and fetch some stock.'));
  el.appendChild(g);
  const held=CMSim.carried(me),arms=cmEl('div','cmArms'+(held>=T.CARRY?' full':''));
  arms.append('In your arms: ',cmEl('b',null,held?Object.entries(me.carry).map(([k,n])=>cmIcon(k)+'×'+n).join(' ')+` (${held}/${T.CARRY})`:`nothing (0/${T.CARRY})`));
  el.appendChild(arms);
  if(!$('#cmTab').hidden)cmTabRender(s);
  const tip=$('#cmTip');const t=!locked&&!noLock?'Click the town to look around. Esc gives you the cursor back.':'';tip.textContent=t;tip.hidden=!t||s.phase!=='day';
}

// what E would do right now, as a line at the bottom of the screen
function cmPromptRender(ctx){
  const el=$('#cmPrompt');
  if(!ctx||!ctx.text){el.hidden=true;return;}
  el.hidden=false;el.className='panel'+(ctx.tone?' '+ctx.tone:'');el.textContent='';
  if(ctx.key)el.appendChild(cmEl('kbd',null,ctx.key));
  el.appendChild(cmEl('span',null,ctx.text));
  if(ctx.sub)el.appendChild(cmEl('span','sub',ctx.sub));
}

/* ---------- Tab: the whole market at a glance ---------- */
function cmTabRender(s){
  const T=CM_TUNE,el=$('#cmTab');el.textContent='';
  el.appendChild(cmEl('h3',null,'🧺 The market'));
  const tb=cmEl('table'),hd=cmEl('tr');for(const h of['','Coins','Sales','On the shelf'])hd.appendChild(cmEl('th',null,h));tb.appendChild(hd);
  for(const id of s.order.slice().sort((a,b)=>s.players[b].coins-s.players[a].coins)){
    const p=s.players[id],st=s.stalls[p.stall],tr=cmEl('tr');
    const nm=cmEl('td');const d=cmEl('span','dot');d.style.cssText=`display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid #2B2040;margin-right:6px;background:${p.col}`;
    nm.append(d,id===CMG.me?'You':p.name+(p.ai?` (${T.RIVALS[p.ai].title})`:''));
    const shelf=Object.keys(T.GOODS).filter(k=>st.stock[k]>0).map(k=>`${cmIcon(k)}${st.stock[k]}@${st.price[k]}`).join('  ')||'—';
    tr.append(nm,cmEl('td','cn','🪙'+p.coins),cmEl('td',null,String(p.st.sales)),cmEl('td',null,shelf));tb.appendChild(tr);
  }
  el.appendChild(tb);
  el.appendChild(cmEl('h3',null,'🗣️ Customers want'));
  const rq=cmEl('div','cmReqs');
  for(const c of s.cust){if(c.ph==='leave')continue;const w=c.want[0];rq.appendChild(cmEl('span',c.ph==='think'?'think':c.ph==='go'||c.ph==='buy'?'go':'',`${cmIcon(w.item)} ≤${w.max}`));}
  if(!rq.children.length)rq.appendChild(cmEl('span',null,'Nobody right now'));
  el.appendChild(rq);
}

/* ---------- the closing bell ---------- */
function cmRecapShow(s){
  const T=CM_TUNE,R=s.recap,body=$('#cmRecapBody');body.textContent='';
  const mine=R.rows.findIndex(r=>r.id===CMG.me);
  body.appendChild(cmEl('h2',null,mine===0?'🏆 You win the day!':'🔔 The market is closed'));
  body.appendChild(cmEl('p','sub',mine===0?'Most coins at the closing bell.':`You came ${['first','second','third','fourth'][mine]}. Leftover stock is worth nothing now.`));
  const ol=cmEl('ol','cmRank');
  R.rows.forEach((r,i)=>{
    const li=cmEl('li',r.id===CMG.me?'me':'');
    li.appendChild(cmEl('span','pl',['🥇','🥈','🥉','🎗️'][i]||''));
    const nm=cmEl('span','nm');const d=cmEl('span','dot');d.style.cssText=`width:14px;height:14px;border-radius:50%;border:2px solid #2B2040;background:${r.col}`;nm.append(d,r.id===CMG.me?'You':r.name);li.appendChild(nm);
    li.appendChild(cmEl('span','cn','🪙'+r.coins));
    const bits=[`${r.sales} sale${r.sales===1?'':'s'}`,r.best?`best ${cmIcon(r.best.item)} for ${r.best.price}`:'no sales',`${r.undercuts} undercut${r.undercuts===1?'':'s'}`,
      r.haggle?`biggest haggle win ${r.haggle}`:'',r.sabotage?`sabotage 🪙${r.sabotage}`:'',`${r.wasted} unsold`].filter(Boolean);
    li.appendChild(cmEl('span','st',bits.join(' · ')));
    ol.appendChild(li);
  });
  body.appendChild(ol);
  if(R.titles.length){const tl=cmEl('ul','cmTitles');for(const t of R.titles){const p=s.players[t.p];const li=cmEl('li');li.append(cmEl('b',null,t.title),`${t.p===CMG.me?'You':p.name}: ${t.why}`);tl.appendChild(li);}body.appendChild(tl);}
  const row=cmEl('div','row');
  const again=cmEl('button','btn','🔁 Trade another day');again.type='button';again.onclick=()=>{cmExit(true);cmStart();};
  const back=cmEl('button','btn alt','← Games');back.type='button';back.onclick=()=>cmExit(false,true);
  row.append(again,back);body.appendChild(row);
  $('#cmRecap').hidden=false;
  if(locked)document.exitPointerLock();
}
