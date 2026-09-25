/* =========================================================
   Daily hunt: the same 6 clues for everyone each (UTC) day
   ========================================================= */
const DAILY_N=6;
function todayKey(d){d=d||new Date();return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');}
function seededRng(str){
  let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
  return ()=>{h=(h+0x6D2B79F5)>>>0;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
}
// the town is built the same way everywhere, so the same seed picks the same things
function dailyPlan(key){
  const rng=seededRng('whereabouts:'+key);
  const pool=W.list.filter(o=>o.p&&!o.mv);const plan=[];
  // each clue gets its own seed, so its format and riddle come out the same for everyone
  while(plan.length<DAILY_N&&pool.length){
    const o=pool.splice(Math.floor(rng()*pool.length),1)[0];
    if(ladderFormats(o).length)plan.push({id:o.id,seed:key+':'+plan.length});
  }
  return plan;
}
async function dailyAfterGame(){
  if(!amHost()||!G.daily)return;
  const names=sortedPlayers().map(p=>clean(p.presence.name)||'Bean').slice(0,6);
  const res=await dailySubmit(G.daily,G.score,G.found,names,G.dsecs||0);
  G.dailyMsg={saved:'Saved to today’s board!',kept:'Your team already has a better score today.',failed:'Couldn’t save this score.'}[res]||'';
  if(G.phase==='recap'&&G.dailyMsg)commit();
}
// >0 when a beats b: more points, or the same points in less time
function dailyBetter(a,b){const d=(+a.score||0)-(+b.score||0);if(d)return d;const sa=+a.secs||0,sb=+b.secs||0;return sa&&sb?sb-sa:0;}
/* ---------- the board on the web version: each team leader's best, kept on the public relay ---------- */
const webDaily=()=>!Cloud.db&&!window.claude;
function dailyWatchAny(key){
  if(Cloud.db){dailyWatch(key);return;}
  if(!webDaily()||Daily.webKey===key)return;
  if(Daily.webKey&&Leaders.client)try{Leaders.client.unsubscribe(WEB_NS+'daily/'+Daily.webKey+'/+');}catch(e){}
  Daily.webKey=key;Daily.web.clear();renderDailyBoards();
  lbConnect().then(c=>{if(c&&Daily.webKey===key)c.subscribe(WEB_NS+'daily/'+key+'/+',{qos:0});});
}
function dailyWebRow(topic,d){
  const [k,id]=topic.slice((WEB_NS+'daily/').length).split('/');
  if(k!==Daily.webKey||!/^[a-z0-9]{12,24}$/.test(id||''))return;
  Daily.web.set(id,dailyRow(id,d));renderDailyBoards();
}
async function dailyWebSubmit(key,score,found,names,secs){
  if(!webDaily())return 'none';
  let best={};try{best=JSON.parse(localStorage.getItem('wb.dbest')||'{}')||{};}catch(e){}
  if(best.key===key&&dailyBetter(best,{score,secs})>=0)return 'kept';
  const c=await lbConnect();if(!c||!c.connected)return 'failed';
  const id=lbMe().id,row={names,score,found,secs,at:Date.now()};
  try{c.publish(WEB_NS+'daily/'+key+'/'+id,JSON.stringify(row),{qos:0,retain:true});}catch(e){return 'failed';}
  try{localStorage.setItem('wb.dbest',JSON.stringify({key,score,secs}));}catch(e){}
  if(Daily.webKey===key){Daily.web.set(id,dailyRow(id,row));renderDailyBoards();}
  return 'saved';
}
function dailyRows(){return (Cloud.db?Daily.rows.slice():[...Daily.web.values()]).sort((a,b)=>dailyBetter(b,a)).slice(0,10);}
function renderBoard(el){
  el.textContent='';
  const note=t=>{const li=document.createElement('li');li.className='none';li.textContent=t;el.appendChild(li);};
  if(!Cloud.db&&!webDaily()){note('Scores are saved when you play in the shared artifact.');return;}
  const rows=dailyRows();
  if(!rows.length){note(Cloud.db||Leaders.client?'No scores yet today. Be the first!':'Loading today’s board…');return;}
  const myId=Cloud.db?Cloud.uid:lbMe().id;
  rows.forEach((r,i)=>{
    const li=document.createElement('li');if(myId&&r.id===myId)li.className='me';
    const a=document.createElement('span');a.textContent=['🥇','🥈','🥉'][i]||String(i+1);
    const b=document.createElement('span');b.textContent=r.names.join(' & ')||'Someone';
    const t=document.createElement('small');t.textContent=r.secs?'⏱ '+fmtT(r.secs*1000):'';
    const c=document.createElement('b');c.textContent=r.score;
    li.append(a,b,t,c);el.appendChild(li);
  });
}
function renderDailyBoards(){
  for(const id of ['#dailyBoard','#recapBoard']){const el=$(id);if(el)renderBoard(el);}
  const note=$('#dailyNote');if(!note)return;
  note.hidden=!Cloud.db&&!webDaily();const top=dailyRows()[0],done=Wallet.stats.days.includes(todayKey());
  note.textContent=(done?'✅ You’ve done today’s challenge. ':`📅 Today’s challenge: the same ${DAILY_N} clues for everyone, and 🪙 ${DAILY_BONUS} for finishing. `)
    +(top?`Top score: ${top.score} by ${top.names.join(' & ')||'someone'}${top.secs?' in '+fmtT(top.secs*1000):''}.`:'Nobody’s played it yet today.');
}
