/* =========================================================
   Game state (the host owns the truth and broadcasts it)
   ========================================================= */
const PROUND_MS=120000,PICK_MS=45000,REVEAL_MS=5500,UNSOLVED_MS=8000,SESSION_PER=75000;
// start: clue lines shown up front; lines: most lines a game clue grows to
const DIFF={
  easy:{label:'Easy',hint:15000,round:120000,mult:0.5,start:2,lines:4},
  normal:{label:'Normal',hint:20000,round:95000,mult:1,start:1,lines:4},
  hard:{label:'Hard',hint:28000,round:90000,mult:2,start:1,lines:3},
};
const diffOf=()=>DIFF[G.diff]||DIFF.normal;
// points: a clue is worth 100 when it appears, 1 less every second, 15 less for every extra hint,
// never under 10; then Easy halves it and Hard doubles it. A wrong guess costs the team 10 (×difficulty).
const PTS={base:100,perSec:1,hint:15,min:10,wrong:10};
const clueMult=()=>G.kind==='game'&&!G.daily?diffOf().mult:1;
const clueHints=()=>Math.max(0,G.lines.length-(G.kind==='game'?(G.daily?DIFF.normal:diffOf()).start:1));
function clueWorth(secs,hints,mult){return Math.round(Math.max(PTS.min,PTS.base-PTS.perSec*Math.floor(secs)-PTS.hint*hints)*mult);}
// Red vs Blue: the first team to find this many wins (or whoever has most when the clues run out)
const TEAM_GOAL=5,TEAM_MAX=15;
const teamWon=()=>G.teams&&((G.tf.r||0)>=TEAM_GOAL||(G.tf.b||0)>=TEAM_GOAL);
function freshState(){return {teams:false,tm:{},ts:{r:0,b:0},hs:false,hider:null,hiderName:'',pts:{},pnames:{},tp:null,phase:'lobby',mode:'game',hot:false,shuf:true,seed:0,total:7,tf:{r:0,b:0},diff:'normal',daily:'',idx:0,score:0,found:0,streak:0,best:0,sessLeft:0,roundLeft:0,hintIn:0,lines:[],kind:'game',spy:null,spyName:'',mv:false,finds:[],reveal:null,dailyMsg:'',r:0,v:0,hostPeer:null};}
let G=freshState();G._recv=Date.now();
const H={target:null,obj:null,ladder:null,fmtLast:null,used:new Set(),plan:null,wrong:false,sessEnd:0,roundEnd:0,nextHintAt:0,pickEnd:0,revealEnd:0,clueStart:0,spyRot:0,lastSync:0,lastTick:0,findIdx:-1};
const Spy={target:null,r:-1};
let wasHost=false;
// answers this device's host has handed out lately (kept across visits), so games don't repeat
const RECENT_KEY='wb.recent',RECENT_MAX=90;
function recentAnswers(){try{const a=JSON.parse(localStorage.getItem(RECENT_KEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
function rememberAnswer(n){try{const a=recentAnswers().filter(x=>x!==n);a.push(n);localStorage.setItem(RECENT_KEY,JSON.stringify(a.slice(-RECENT_MAX)));}catch(e){}}
const liveLeft=f=>Math.max(0,(G[f]||0)-(Date.now()-(G._recv||Date.now())));

function commit(){
  const now=Date.now();
  G.hostPeer=myPeer();G.v=(G.v||0)+1;
  // clue counts from before (6 or 8, or a finished Red vs Blue or daily game) go back to a normal choice
  if(G.phase==='lobby'&&!G.daily&&!G.teams&&!G.hs&&![5,7,10].includes(G.total))G.total=7;
  const inPlay=G.phase!=='lobby'&&G.phase!=='recap';
  if(G.teams&&G.phase!=='recap')assignTeams();
  G.sessLeft=inPlay?Math.max(0,H.sessEnd-now):0;
  G.roundLeft=!inPlay?0:Math.max(0,(G.phase==='pick'?H.pickEnd:G.phase==='reveal'?H.revealEnd:G.phase==='hide'?H.hideEnd:G.phase==='seek'?H.seekEnd:H.roundEnd)-now);
  G.hintIn=(G.phase==='clue'&&G.kind==='game'&&G.lines.length<diffOf().lines)?Math.max(0,H.nextHintAt-now):0;
  G._recv=now;
  const out=Object.assign({},G);delete out._recv;
  emit('wb.state',{s:out});H.lastSync=now;
  roomDocSave(out);
  renderAll();
}
// take a state from the host (live over the room, or the db backup); recv = when its clocks were read
function adoptState(s,recv){
  G=Object.assign(freshState(),s);G._recv=recv;
  G.lines=Array.isArray(G.lines)?G.lines.slice(0,4).map(x=>clean(x,160)):[];
  G.finds=Array.isArray(G.finds)?G.finds.slice(0,12):[];
  if(!DIFF[G.diff])G.diff='normal';
  if(G.mode!=='player')G.mode='game';G.hot=!!G.hot;G.shuf=G.shuf!==false;G.seed=(Math.floor(+G.seed)||0)>>>0;
  G.tp=Array.isArray(G.tp)&&G.tp.length===2&&G.tp.every(Number.isFinite)?G.tp:null;
  G.daily=typeof G.daily==='string'&&/^\d{4}-\d\d-\d\d$/.test(G.daily)?G.daily:'';
  G.dailyMsg=clean(G.dailyMsg,80);G.dsecs=clamp(Math.round(+G.dsecs||0),0,36000);
  const peerMap=(o,ok)=>o&&typeof o==='object'&&!Array.isArray(o)?Object.fromEntries(Object.entries(o).slice(0,32).filter(([k,v])=>typeof k==='string'&&ok(v))):{};
  G.teams=!!G.teams;G.tm=peerMap(G.tm,v=>v==='r'||v==='b');G.ts={r:Math.max(0,+(G.ts&&G.ts.r)||0),b:Math.max(0,+(G.ts&&G.ts.b)||0)};G.tf={r:clamp(Math.floor(+(G.tf&&G.tf.r)||0),0,99),b:clamp(Math.floor(+(G.tf&&G.tf.b)||0),0,99)};
  G.hs=!!G.hs;G.hider=typeof G.hider==='string'?G.hider:null;G.hiderName=clean(G.hiderName);
  G.pts=peerMap(G.pts,v=>Number.isFinite(v));G.pnames=Object.fromEntries(Object.entries(peerMap(G.pnames,v=>typeof v==='string')).map(([k,v])=>[k,clean(v)]));
  if(G.reveal&&typeof G.reveal==='object'){const R=G.reveal;
    R.bonus=Array.isArray(R.bonus)?R.bonus.slice(0,4).map(x=>clean(x,40)):[];
    R.gp=clean(R.gp,40);R.team=R.team==='r'||R.team==='b'?R.team:'';R.hs=!!R.hs;R.why=clean(R.why,8);R.secs=clamp(Math.round(+R.secs||0),0,600);R.coins=clamp(Math.round(+R.coins||0),0,100);R.wrong=clamp(Math.round(+R.wrong||0),0,99);}
  renderAll();
}
function hostTick(){
  const now=Date.now();if(now-H.lastTick<200)return;H.lastTick=now;
  const ah=amHost();if(ah&&!wasHost)takeOver();wasHost=ah;if(!ah)return;
  if(G.hs&&G.phase!=='lobby'&&G.phase!=='recap'){if(hideTick(now))return;if(now-H.lastSync>2000)commit();return;}
  const inPlay=G.phase!=='lobby'&&G.phase!=='recap';
  if(inPlay&&now>=H.sessEnd&&G.phase!=='reveal'){endGame();return;}
  if(G.phase==='pick'){
    const spyHere=players().some(p=>p.peer===G.spy);
    if(now>=H.pickEnd||!spyHere){sys(spyHere?`${G.spyName} ran out of time, so the game picked one instead.`:'The Spy left, so the game picked one instead.');startGameClue();return;}
  }
  if(G.phase==='clue'){
    const D=diffOf();
    if(G.kind==='game'&&G.lines.length<D.lines&&now>=H.nextHintAt){
      const i=G.lines.length;G.lines.push(i===1?H.ladder.l2:i===2?locationLine(H.obj):letterLine(H.obj));H.nextHintAt=now+D.hint;commit();return;
    }
    if(G.kind==='player'&&!players().some(p=>p.peer===G.spy)){revealUnsolved();return;}
    if(now>=H.roundEnd){revealUnsolved();return;}
  }
  if(G.phase==='reveal'&&now>=H.revealEnd){if(now>=H.sessEnd)endGame();else nextClue();return;}
  if(now-H.lastSync>2000)commit();
}
function takeOver(){
  if(!myCode)return;const now=Date.now();
  if(G.phase==='lobby'||G.phase==='recap'){commit();return;}
  if(G.daily&&!H.plan)H.plan=dailyPlan(G.daily);
  if(G.hs){if(!H.order)H.order=sortedPlayers().map(p=>p.peer);H.sessEnd=now+10*60000;
    if(G.phase==='hide')H.hideEnd=now+liveLeft('roundLeft');if(G.phase==='seek')H.seekEnd=now+Math.max(10000,liveLeft('roundLeft'));if(G.phase==='reveal')H.revealEnd=now+2500;
    commit();return;}
  H.sessEnd=now+Math.max(15000,liveLeft('sessLeft'));
  if(G.phase==='clue'&&G.kind==='game'&&H.target==null){sys('New host! Here’s a fresh clue.');G.idx--;nextClue();return;}
  if(G.phase==='pick')H.pickEnd=now+liveLeft('roundLeft');
  if(G.phase==='clue'){H.roundEnd=now+Math.max(10000,liveLeft('roundLeft'));H.clueStart=now;}
  if(G.phase==='reveal')H.revealEnd=now+2500;
  commit();
}
function startGame(){
  if(!amHost())return;
  H.used=new Set();H.spyRot=Math.floor(Math.random()*6);
  if(G.hs){startHideSeek();return;}
  if(G.daily){G.mode='game';G.total=DAILY_N;G.diff='normal';G.teams=false;H.plan=dailyPlan(G.daily);}else H.plan=null;
  if(G.teams){G.mode='game';G.ts={r:0,b:0};G.tf={r:0,b:0};G.total=TEAM_MAX;assignTeams();}   // keeps the teams picked in the lobby
  G.hot=G.diff==='easy'&&!G.daily;
  // a new layout for this game (the daily one is the same for everyone that day), before any clue is picked
  G.seed=G.shuf?(G.daily?hashSeed('daily:'+G.daily):1+Math.floor(Math.random()*2147483646)):0;shuffleTown(G.seed);   // the hot/cold meter starts on for Easy; the host can switch it any time
  G.score=0;G.found=0;G.streak=0;G.best=0;G.finds=[];G.dailyMsg='';G.idx=-1;G.dsecs=0;H.gameStart=Date.now();
  H.sessEnd=Date.now()+G.total*SESSION_PER;
  nextClue();
}
function nextClue(){
  const now=Date.now();G.idx++;
  if(G.idx>=G.total||now>=H.sessEnd||teamWon()){endGame();return;}
  const n=players().length;let kind='game';
  if(!G.daily&&!G.teams){
    if(G.mode==='player'&&n>=2)kind='player';
  }
  if(kind==='game')startGameClue();else startPick();
}
function startGameClue(){
  const now=Date.now(),D=diffOf();
  let o,ladder;
  const planned=H.plan&&H.plan[G.idx]&&W.list[H.plan[G.idx].id];
  if(planned){o=planned;ladder=makeLadder(o,null,null,seededRng(H.plan[G.idx].seed));}
  else{
    let pool=W.list.filter(o=>o.p&&!H.used.has(o.id));if(!pool.length){H.used.clear();pool=W.list.filter(o=>o.p);}
    // easy: big, still things; hard: the small stuff
    if(G.diff==='easy'){const big=pool.filter(o=>!o.mv&&objSize(o)>=1.6);if(big.length)pool=big;}
    if(G.diff==='hard'){const small=pool.filter(o=>objSize(o)<2.2);if(small.length)pool=small;}
    const recent=new Set(recentAnswers()),fresh=pool.filter(o=>!recent.has(o.n));if(fresh.length>=3)pool=fresh;
    o=pick(pool);ladder=makeLadder(o,H.fmtLast,G.diff==='easy'?EASY_FMTS:G.diff==='hard'?HARD_FMTS:null);
  }
  H.used.add(o.id);H.target=o.id;H.obj=o;H.ladder=ladder;H.fmtLast=ladder.fmt;H.wrong=false;H.wrongN=0;rememberAnswer(o.n);
  // the warmer/colder meter: on from the start on Easy, and for anyone still stuck after a while otherwise
  {const c=objCenter(o);G.tp=[Math.round(c.x*10)/10,Math.round(c.z*10)/10];}
  const lines=[ladder.l1];if(D.start>1)lines.push(ladder.l2);
  Object.assign(G,{kind:'game',spy:null,spyName:'',lines,mv:!!o.mv,phase:'clue',reveal:null});G.r++;
  H.clueStart=now;H.roundEnd=now+D.round;H.nextHintAt=now+D.hint;
  commit();
}
function startPick(){
  const now=Date.now();const ps=sortedPlayers();const sp=ps[H.spyRot++%ps.length];
  Object.assign(G,{tp:null,kind:'player',spy:sp.peer,spyName:clean(sp.presence.name)||'Someone',lines:[],mv:false,phase:'pick',reveal:null});G.r++;
  H.target=null;H.obj=null;H.wrong=false;H.wrongN=0;H.pickEnd=now+PICK_MS;
  commit();
}
function revealUnsolved(){
  const now=Date.now();
  const id=G.kind==='game'?H.target:null;
  G.streak=0;
  G.finds.push({c:(G.lines[0]||'').slice(0,110),n:id!=null?W.list[id].n:'',by:'',p:0});H.findIdx=G.finds.length-1;
  G.phase='reveal';G.reveal={found:false,id,name:id!=null?W.list[id].n:'',by:'',pts:0,bonus:[]};
  H.revealEnd=now+UNSOLVED_MS;commit();   // longer, so everyone can find where it was
}
// Red vs Blue: everyone gets a side, newcomers join the smaller team
function assignTeams(){
  const ps=sortedPlayers(),tm={};let r=0,b=0;
  for(const p of ps){const t=G.tm[p.peer];if(t==='r'||t==='b'){tm[p.peer]=t;t==='r'?r++:b++;}}
  for(const p of ps)if(!tm[p.peer]){const t=r<=b?'r':'b';tm[p.peer]=t;t==='r'?r++:b++;}
  G.tm=tm;
}
function endGame(){G.phase='recap';H.target=null;if(G.daily)G.dsecs=Math.round((Date.now()-(H.gameStart||Date.now()))/1000);commit();if(G.daily)dailyAfterGame();}

function applyResultAsHost(d,now){
  if(G.phase!=='clue')return;
  const o=W.list[d.id];
  if(d.ok){
    const ms=now-H.clueStart,hintsUsed=clueHints(),mult=clueMult();
    const pts=clueWorth(ms/1000,hintsUsed,mult),bonus=[];
    if(hintsUsed)bonus.push(`💡 ${hintsUsed} hint${hintsUsed>1?'s':''} −${PTS.hint*hintsUsed*mult}`);
    if(H.wrongN)bonus.push(`❌ ${H.wrongN} wrong −${PTS.wrong*H.wrongN*mult}`);
    G.score+=pts;G.found++;
    const team=G.teams?G.tm[d.gp]:null;if(team){G.ts[team]=(G.ts[team]||0)+pts;G.tf[team]=(G.tf[team]||0)+1;}
    G.finds.push({c:(G.lines[0]||'').slice(0,110),n:o.n,by:clean(d.gn),p:pts,s:Math.round(ms/1000)});
    G.phase='reveal';G.reveal={found:true,id:d.id,name:o.n,by:clean(d.gn),pts,bonus,team:team||'',gp:String(d.gp||''),secs:Math.round(ms/1000),coins:coinsFor(pts)};
    H.revealEnd=now+REVEAL_MS;commit();
  }else{
    // a wrong guess costs the guesser's team points straight away
    const pen=PTS.wrong*clueMult(),team=G.teams?G.tm[d.gp]:null;
    G.score=Math.max(0,G.score-pen);if(team)G.ts[team]=Math.max(0,(G.ts[team]||0)-pen);
    H.wrong=true;H.wrongN=(H.wrongN||0)+1;commit();
  }
}

/* ---------- message handling ---------- */
const celebrated=new Set();
let guessCD=0;
function onMsg(topic,m){
  const d=m&&m.data;if(!d||typeof d!=='object'||d.code!==myCode||!myCode)return;
  const now=Date.now();
  switch(topic){
    case 'wb.state':{
      if(m.sameTab)return;                    // our own broadcast, already applied
      if(m.peer!==hostPeer())return;           // only the host speaks for the room
      const s=d.s;if(!s||typeof s!=='object')return;
      adoptState(s,now);break;
    }
    case 'wb.guess':{
      if(G.phase!=='clue'||d.r!==G.r)return;
      const id=d.id|0;if(!W.list[id])return;
      if(G.kind==='game'){if(amHost())emit('wb.result',{r:G.r,ok:id===H.target,id,gp:m.peer,gn:clean(d.n)});}
      else if(G.spy===myPeer()&&Spy.r===G.r&&m.peer!==G.spy)emit('wb.result',{r:G.r,ok:id===Spy.target,id,gp:m.peer,gn:clean(d.n)});
      break;
    }
    case 'wb.result':{
      const auth=G.kind==='game'?hostPeer():G.spy;if(m.peer!==auth||d.r!==G.r)return;
      const id=d.id|0;const o=W.list[id];if(!o)return;
      if(d.reveal){
        if(amHost()&&G.phase==='reveal'&&G.reveal&&G.reveal.id==null){G.reveal.id=id;G.reveal.name=o.n;if(G.finds[H.findIdx])G.finds[H.findIdx].n=o.n;commit();}
        return;
      }
      if(d.ok){
        if(!celebrated.has(G.r)){celebrated.add(G.r);celebrate(o,d);}
        if(amHost())applyResultAsHost(d,now);
      }else{
        if(d.gp===myPeer()){sfx.thud();buzz(120);flashOutline(o,RED,0.8);toast(`Not the ${o.n.replace(/^(the|a|an) /,'')}\n−${PTS.wrong*clueMult()} points`);redFlash();}
        else sys(`${clean(d.gn)} tried ${o.n}. Nope!`);
        if(amHost())applyResultAsHost(d,now);
      }
      break;
    }
    case 'wb.chat':{
      const txt=clean(d.t,160);if(!txt)return;
      addChat(peerName(m.peer),peerCol(m.peer),txt,m.peer===G.spy&&(G.phase==='clue'||G.phase==='pick')&&d.spy);
      if(!m.sameTab)sfx.tick();break;
    }
    case 'wb.ping':{
      const x=+d.x,y=+d.y,z=+d.z;if(![x,y,z].every(Number.isFinite))return;
      addPing(x,y,z,peerCol(m.peer),peerName(m.peer));break;
    }
    case 'wb.spyclue':{
      if(!amHost()||m.peer!==G.spy||G.phase!=='pick'||d.r!==G.r)return;
      const txt=clean(d.t,120);if(!txt)return;
      G.lines=[txt];G.mv=!!d.mv;G.phase='clue';H.wrong=false;H.wrongN=0;H.roundEnd=now+PROUND_MS;H.clueStart=now;commit();break;
    }
    case 'wb.tag':{onTag(m,d);break;}
    case 'wb.spyhint':{
      if(!amHost()||m.peer!==G.spy||G.phase!=='clue'||G.kind!=='player'||d.r!==G.r||G.lines.length>=3)return;
      const txt=clean(d.t,110);if(!txt)return;G.lines.push('…'+txt.replace(/^…+/,''));commit();break;
    }
  }
}
