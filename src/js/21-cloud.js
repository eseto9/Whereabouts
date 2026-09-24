/* =========================================================
   Cloud: the artifact's shared db (daily scores, a backup of
   each room's game state for late joiners, your coins and clothes).
   Everything here is optional: without db the game plays the same.
   ========================================================= */
const Cloud={db:null,uid:null};
async function cloudInit(){
  if(!(window.claude&&typeof window.claude.use==='function'))return;
  try{Cloud.db=await window.claude.use('db');}catch(e){Cloud.db=null;}
  try{const u=await window.claude.use('user');Cloud.uid=u?await u.id():null;}catch(e){Cloud.uid=null;}
  if(!Cloud.db){renderDailyBoards();return;}
  walletPull();dailyWatch(todayKey());
  if(myCode)roomDocWatch(myCode);
}
// one write at a time per document; if more arrive meanwhile, only the latest is written next
function docWriter(){
  let busy=false,next=null;
  return async function write(ref,data){
    next={ref,data};if(busy)return;busy=true;
    while(next){
      const w=next;next=null;
      try{await w.ref.set(w.data);}
      catch(e){if(e&&e.code==='unavailable'){await new Promise(r=>setTimeout(r,600+Math.random()*900));try{await w.ref.set(w.data);}catch(e2){}}}
    }
    busy=false;
  };
}

/* ---------- room backup: the host saves the game state, joiners read it ---------- */
const RoomDoc={unsub:null,code:null,sig:'',write:docWriter()};
function roomDocWatch(code){
  if(!Cloud.db)return;
  if(RoomDoc.unsub){RoomDoc.unsub();RoomDoc.unsub=null;}
  RoomDoc.code=code;RoomDoc.sig='';
  try{RoomDoc.unsub=Cloud.db.doc('rooms/'+code).onSnapshot(snap=>{if(snap.exists)applyRoomDoc(snap.data());},()=>{RoomDoc.unsub=null;});}catch(e){}
}
function applyRoomDoc(d){
  if(!d||!myCode||RoomDoc.code!==myCode||amHost())return;
  const s=d.s;if(!s||typeof s!=='object')return;
  const age=Date.now()-(+d.at||0);
  if(!(age>=-5000&&age<10*60000))return;                     // stale, or a badly wrong clock
  const hostHere=players().some(p=>p.peer===d.host);
  const newer=(+s.v||0)>(G.v||0)&&d.host===hostPeer();
  const nothingYet=!G.v&&hostHere;                           // joined, and the room hasn't told us anything yet
  if(!newer&&!nothingYet)return;
  adoptState(s,Date.now()-clamp(age,0,20000));
}
// called by the host from commit(); writes only when something other than the clocks changed
function roomDocSave(out){
  if(!Cloud.db||!myCode)return;
  const rest=Object.assign({},out);delete rest.sessLeft;delete rest.roundLeft;delete rest.hintIn;delete rest.v;
  const sig=JSON.stringify(rest);if(sig===RoomDoc.sig)return;RoomDoc.sig=sig;
  try{RoomDoc.write(Cloud.db.doc('rooms/'+myCode),{s:out,at:Date.now(),host:myPeer()});}catch(e){}
}
// rooms nobody has touched for a day are just clutter
async function roomDocPrune(){
  if(!Cloud.db)return;
  try{const q=await Cloud.db.collection('rooms').where('at','<',Date.now()-864e5).limit(20).get();
    for(const d of q.docs){try{await Cloud.db.doc('rooms/'+d.id).delete();}catch(e){}}}catch(e){}
}

/* ---------- your coins and clothes, private to you ---------- */
const walletWrite=docWriter();
const walletRef=()=>Cloud.db.doc('data/users/'+Cloud.uid+'/wallet');
async function walletPull(){
  if(!Cloud.db||!Cloud.uid)return;
  try{const snap=await walletRef().get();if(snap.exists)walletMerge(snap.data());}catch(e){}
  walletPush();
}
function walletPush(){if(Cloud.db&&Cloud.uid){try{walletWrite(walletRef(),{coins:Wallet.coins,owned:Wallet.owned.slice(),found:Wallet.found.slice(),at:Wallet.at});}catch(e){}}}

/* ---------- today's daily-hunt board ---------- */
const Daily={key:'',rows:[],unsub:null};
function dailyWatch(key){
  if(!Cloud.db||(Daily.unsub&&Daily.key===key))return;
  if(Daily.unsub)Daily.unsub();Daily.key=key;Daily.rows=[];
  try{Daily.unsub=Cloud.db.collection('daily/'+key+'/teams').orderBy('score','desc').limit(10)
    .onSnapshot(q=>{Daily.rows=q.docs.map(d=>dailyRow(d.id,d.data()));renderDailyBoards();},()=>{Daily.unsub=null;});}catch(e){}
}
function dailyRow(id,d){
  d=d||{};
  return {id,names:(Array.isArray(d.names)?d.names:[]).slice(0,6).map(n=>clean(n,14)).filter(Boolean),
    score:clamp(Math.round(+d.score||0),0,9999),found:clamp(Math.round(+d.found||0),0,DAILY_N)};
}
// keeps each team leader's best score for the day
async function dailySubmit(key,score,found,names){
  if(!Cloud.db)return 'none';
  let ref;
  try{ref=Cloud.db.doc('daily/'+key+'/teams/'+(Cloud.uid||'t'+Math.random().toString(36).slice(2,10)));}
  catch(e){ref=Cloud.db.doc('daily/'+key+'/teams/t'+Math.random().toString(36).slice(2,10));}
  try{
    const cur=await ref.get();
    if(cur.exists&&(+cur.data().score||0)>=score)return 'kept';
    await ref.set({names,score,found,at:Date.now()});return 'saved';
  }catch(e){return 'failed';}
}
