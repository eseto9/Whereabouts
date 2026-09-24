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
  const pool=W.list.filter(o=>o.p&&!o.mv);const plan=[];let last=null;
  while(plan.length<DAILY_N&&pool.length){
    const o=pool.splice(Math.floor(rng()*pool.length),1)[0];
    let fs=ladderFormats(o).filter(x=>x!==last);if(!fs.length)fs=ladderFormats(o);if(!fs.length)continue;
    const fmt=fs[Math.floor(rng()*fs.length)];last=fmt;plan.push({id:o.id,fmt});
  }
  return plan;
}
async function dailyAfterGame(){
  if(!amHost()||!G.daily)return;
  const names=sortedPlayers().map(p=>clean(p.presence.name)||'Bean').slice(0,6);
  const res=await dailySubmit(G.daily,G.score,G.found,names);
  G.dailyMsg={saved:'Saved to today’s board!',kept:'Your team already has a better score today.',failed:'Couldn’t save this score.'}[res]||'';
  if(G.phase==='recap'&&G.dailyMsg)commit();
}
function renderBoard(el){
  el.textContent='';
  const note=t=>{const li=document.createElement('li');li.className='none';li.textContent=t;el.appendChild(li);};
  if(!Cloud.db){note('Scores are saved when you play in the shared artifact.');return;}
  if(!Daily.rows.length){note('No scores yet today. Be the first!');return;}
  Daily.rows.forEach((r,i)=>{
    const li=document.createElement('li');if(Cloud.uid&&r.id===Cloud.uid)li.className='me';
    const a=document.createElement('span');a.textContent=['🥇','🥈','🥉'][i]||String(i+1);
    const b=document.createElement('span');b.textContent=r.names.join(' & ')||'Someone';
    const c=document.createElement('b');c.textContent=r.score;
    li.append(a,b,c);el.appendChild(li);
  });
}
function renderDailyBoards(){
  for(const id of ['#dailyBoard','#recapBoard']){const el=$(id);if(el)renderBoard(el);}
  const note=$('#dailyNote');if(!note)return;
  note.hidden=!Cloud.db;const top=Daily.rows[0];
  note.textContent=top?`📅 Today’s daily hunt: top score ${top.score} by ${top.names.join(' & ')||'someone'}. Can you beat it?`:'📅 Today’s daily hunt is waiting. Start a room and pick Daily hunt.';
}
