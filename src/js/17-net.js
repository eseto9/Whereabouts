/* =========================================================
   Networking (room capability, with a solo loopback)
   ========================================================= */
const TOPICS=['wb.state','wb.guess','wb.result','wb.chat','wb.ping','wb.spyclue','wb.spyhint'];
const Net={room:null,local:true,myPres:{},warned:false,resolved:false};
let myCode=null,myName='',myCol=BEAN_COLORS[0],myFit=Object.assign({},DEFAULT_FIT);
function clean(s,n){return String(s==null?'':s).replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff\ue000-\uf8ff]/g,'').trim().slice(0,n||14);}
const safeCol=c=>BEAN_COLORS.includes(c)?c:BEAN_COLORS[0];
async function netInit(){
  let room=null;
  try{if(window.claude&&typeof window.claude.use==='function')room=await window.claude.use('room');}catch(e){room=null;}
  Net.resolved=true;
  if(!room){Net.local=true;$('#netNote').textContent='Multiplayer isn’t available in this view, so you’ll play solo. Friends can join from the shared artifact.';return;}
  Net.room=room;Net.local=false;
  room.onPeers(ch=>onPeers(ch),e=>{console.warn('room',e);});
  for(const t of TOPICS) room.on(t,m=>onMsg(t,m),e=>console.warn(t,e));
  $('#netNote').textContent='Start a room and share the 4-letter code, or join a friend’s code.';
  if(myCode){room.presence(Net.myPres).catch(()=>{});}
}
function presence(patch){Object.assign(Net.myPres,patch);if(Net.room)Net.room.presence(patch).catch(()=>{});}
let lastPres=0;
function sendPresence(force){
  if(!myCode)return;const t=performance.now();if(!force&&t-lastPres<80)return;lastPres=t;
  presence({x:Math.round(P.pos.x*100)/100,y:Math.round(P.pos.y*100)/100,z:Math.round(P.pos.z*100)/100,ry:Math.round(P.face*100)/100,an:P.an,bi:P.bino?1:0,em:P.em||'',emAt:P.emAt||0});
}
function emit(topic,data){
  data=Object.assign({code:myCode},data);
  if(Net.room){Net.room.emit(topic,data).catch(e=>{if(e&&e.code==='not_permitted'&&!Net.warned){Net.warned=true;sys('Your moves can’t reach the others yet. Ask the artifact owner to give you interact access.');}});}
  else{const msg={topic,data,peer:'local',by:null,isMe:true,sameTab:true,kind:'viewer',guest:false};setTimeout(()=>onMsg(topic,msg),0);}
}
function myPeer(){if(!Net.room)return 'local';const me=Net.room.peers().find(p=>p.sameTab);return me?me.peer:'me';}
function players(){
  if(!myCode)return [];
  if(!Net.room)return [{peer:'local',presence:Net.myPres,isMe:true,sameTab:true}];
  const list=Net.room.peers().filter(p=>p.kind==='viewer'&&p.presence&&p.presence.code===myCode);
  if(!list.some(p=>p.sameTab))list.push({peer:myPeer(),presence:Net.myPres,isMe:true,sameTab:true});
  return list;
}
function sortedPlayers(){return players().slice().sort((a,b)=>((a.presence.joinedAt||9e15)-(b.presence.joinedAt||9e15))||(a.peer<b.peer?-1:1));}
function hostPeer(){const s=sortedPlayers();return s.length?s[0].peer:null;}
function amHost(){return hostPeer()===myPeer();}
function peerName(peer){const p=players().find(x=>x.peer===peer);return p?clean(p.presence.name)||'Someone':'Someone';}
function peerCol(peer){const p=players().find(x=>x.peer===peer);return p?safeCol(p.presence.col):'#888';}
function onPeers(ch){
  if(myCode)renderAll();
  if(myCode&&amHost()&&ch.joined&&ch.joined.some(p=>!p.sameTab))setTimeout(()=>{if(amHost())commit();},400);
}
W.nearBeans=(x,z,r)=>{
  if(P.bean&&Math.hypot(P.pos.x-x,P.pos.z-z)<r)return true;
  for(const rb of Remote.values()){if(Math.hypot(rb.bean.position.x-x,rb.bean.position.z-z)<r)return true;}
  return false;
};

