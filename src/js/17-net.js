/* =========================================================
   Networking (room capability; a public web relay outside Claude;
   a solo loopback when neither is there)
   ========================================================= */
const TOPICS=['wb.state','wb.guess','wb.result','wb.chat','wb.ping','wb.spyclue','wb.spyhint'];
const Net={room:null,local:true,web:false,myPres:{},warned:false,resolved:false};
let myCode=null,myName='',myCol=BEAN_COLORS[0],myFit=Object.assign({},DEFAULT_FIT);
function clean(s,n){return String(s==null?'':s).replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff\ue000-\uf8ff]/g,'').trim().slice(0,n||14);}
const safeCol=c=>BEAN_COLORS.includes(c)?c:BEAN_COLORS[0];
async function netInit(){
  let room=null;
  try{if(window.claude&&typeof window.claude.use==='function')room=await window.claude.use('room');}catch(e){room=null;}
  // not inside Claude at all (e.g. GitHub Pages): play online through the web relay
  if(!room&&!window.claude){room=webRoom();Net.web=true;}
  Net.resolved=true;
  if(!room){Net.local=true;$('#netNote').textContent='Multiplayer isn’t available in this view, so you’ll play solo. Friends can join from the shared artifact.';return;}
  Net.room=room;Net.local=false;
  room.onPeers(ch=>onPeers(ch),e=>{console.warn('room',e);});
  for(const t of TOPICS) room.on(t,m=>onMsg(t,m),e=>console.warn(t,e));
  $('#netNote').textContent=Net.web?'Online play: start a room and send friends the 4-letter code. They open this same page and join with it.':'Start a room and share the 4-letter code, or join a friend’s code.';
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

/* ---------- web room: multiplayer outside Claude (GitHub Pages) ----------
   The same shape as the artifact runtime's room (emit / on / presence / peers / onPeers),
   carried over a free public MQTT relay. Everyone in one room code shares one topic tree;
   anyone who knows the code could listen in, so nothing private goes through it. */
const WEB_RELAYS=['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt','wss://test.mosquitto.org:8081/mqtt'];
const WEB_NS='whereabouts-eseto9/v1/';
const MQTT_SRC='https://cdn.jsdelivr.net/npm/mqtt@5.16.0/dist/mqtt.min.js';
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function webRoom(){
  const ME='w'+Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,6);
  const HEARTBEAT=2000,TIMEOUT=7000,SEND_MS=100;
  const known=new Map([[ME,{presence:Object.freeze({}),updatedAt:Date.now(),seen:Infinity}]]);
  const frozen=new Map(),topics=new Map(),peerHandlers=new Set();
  const pending={joined:new Set([ME]),left:new Map(),updated:new Set()};
  let snapshot=null,flushT=null,client=null,code=null,lastSent=0,sendT=null,relay=0,status='idle';
  const sender=peer=>({peer,by:null,isMe:peer===ME,sameTab:peer===ME,kind:'viewer',guest:false});
  const peerObj=id=>{const k=known.get(id);let p=frozen.get(id);if(!p||p.presence!==k.presence){p=Object.freeze(Object.assign(sender(id),{presence:k.presence,updatedAt:k.updatedAt}));frozen.set(id,p);}return p;};
  const peers=()=>snapshot||(snapshot=Object.freeze([...known.keys()].map(peerObj)));
  function touch(kind,id){
    snapshot=null;
    if(kind==='joined'){pending.joined.add(id);pending.left.delete(id);}
    else if(kind==='left'){if(!pending.joined.delete(id))pending.left.set(id,frozen.get(id)||Object.freeze(Object.assign(sender(id),{presence:Object.freeze({}),updatedAt:Date.now()})));pending.updated.delete(id);frozen.delete(id);}
    else if(!pending.joined.has(id))pending.updated.add(id);
    if(!flushT&&peerHandlers.size)flushT=setTimeout(flush,16);
  }
  function flush(){
    flushT=null;
    const ch=Object.freeze({peers:peers(),joined:Object.freeze([...pending.joined].filter(id=>known.has(id)).map(peerObj)),
      left:Object.freeze([...pending.left.values()]),updated:Object.freeze([...pending.updated].filter(id=>known.has(id)).map(peerObj))});
    pending.joined.clear();pending.left.clear();pending.updated.clear();
    if(ch.joined.length||ch.left.length||ch.updated.length)for(const h of [...peerHandlers]){try{h(ch);}catch(e){console.error(e);}}
  }
  function setPresence(id,pres){
    const had=known.has(id),k=known.get(id)||{presence:Object.freeze({}),updatedAt:0,seen:0};
    k.seen=id===ME?Infinity:Date.now();
    const changed=!had||JSON.stringify(k.presence)!==JSON.stringify(pres);
    if(changed){k.presence=Object.freeze(pres);k.updatedAt=Date.now();}
    known.set(id,k);if(!had)touch('joined',id);else if(changed)touch('updated',id);
  }
  function drop(id){if(id!==ME&&known.delete(id))touch('left',id);}
  function deliver(topic,from,data){
    const hs=topics.get(topic);if(!hs)return;
    const msg=Object.freeze(Object.assign(sender(from),{topic,data}));
    for(const h of [...hs]){try{h(msg);}catch(e){console.error(e);}}
  }
  const base=()=>WEB_NS+code+'/';
  const pub=(t,obj)=>{if(client&&client.connected)client.publish(base()+t,JSON.stringify(obj),{qos:0});};
  function announce(){lastSent=Date.now();pub('p/'+ME,{p:known.get(ME).presence});}
  function onMessage(t,buf){
    let m;try{m=JSON.parse(new TextDecoder().decode(buf));}catch(e){return;}
    if(!m||typeof m!=='object')return;
    const rest=t.slice(base().length);
    if(rest.startsWith('p/')){
      const id=rest.slice(2);if(id===ME||!/^w[a-z0-9]{6,20}$/.test(id))return;
      if(m.bye){drop(id);return;}
      if(m.p&&typeof m.p==='object'&&!Array.isArray(m.p))setPresence(id,m.p);
    }else if(rest==='hello'){if(m.from!==ME)announce();}
    else if(rest==='e'){
      if(m.from===ME||typeof m.topic!=='string'||typeof m.from!=='string')return;
      if(!known.has(m.from))return;                  // only from players we can see
      deliver(m.topic,m.from,m.data);
    }
  }
  async function connect(){
    if(client){try{pub('p/'+ME,{bye:1});client.end(true);}catch(e){}client=null;}
    for(const id of [...known.keys()])drop(id);
    if(!code)return;
    if(!window.mqtt){try{await loadScript(MQTT_SRC);}catch(e){status='failed';return;}}
    const my=code,url=WEB_RELAYS[relay%WEB_RELAYS.length];status='connecting';
    const c=window.mqtt.connect(url,{clientId:ME,clean:true,keepalive:20,reconnectPeriod:3000,connectTimeout:8000,
      will:{topic:WEB_NS+my+'/p/'+ME,payload:JSON.stringify({bye:1}),qos:0,retain:false}});
    client=c;let ever=false;
    c.on('connect',()=>{ever=true;status='online';c.subscribe(WEB_NS+my+'/#',{qos:0},()=>{pub('hello',{from:ME});announce();});});
    c.on('message',onMessage);
    // a relay that never answers: move on to the next one
    setTimeout(()=>{if(client===c&&!ever&&code===my){relay++;connect();}},9000);
    c.on('offline',()=>{if(client===c)status='reconnecting';});
  }
  setInterval(()=>{
    if(!client)return;
    if(Date.now()-lastSent>=HEARTBEAT)announce();
    const now=Date.now();for(const [id,k] of known)if(id!==ME&&now-k.seen>TIMEOUT)drop(id);
  },1000);
  addEventListener('pagehide',()=>{try{pub('p/'+ME,{bye:1});}catch(e){}});
  const room={
    async emit(topic,data){
      pub('e',{from:ME,topic,data});
      setTimeout(()=>deliver(topic,ME,data),0);     // our own echo, as the artifact room does
    },
    on(topic,handler){if(!topics.has(topic))topics.set(topic,new Set());const h=m=>handler(m);topics.get(topic).add(h);return ()=>topics.get(topic).delete(h);},
    async presence(patch){
      const next=Object.assign({},known.get(ME).presence);
      for(const [k,v] of Object.entries(patch||{})){if(v===null)delete next[k];else next[k]=v;}
      setPresence(ME,JSON.parse(JSON.stringify(next)));
      const c=typeof next.code==='string'?next.code:null;
      if(c!==code){code=c;connect();return;}
      // coalesce: at most one presence message per SEND_MS
      if(Date.now()-lastSent>=SEND_MS)announce();
      else if(!sendT)sendT=setTimeout(()=>{sendT=null;announce();},SEND_MS);
    },
    peers,
    onPeers(handler){
      const h=c=>handler(c);peerHandlers.add(h);
      queueMicrotask(()=>{if(peerHandlers.has(h))handler(Object.freeze({peers:peers(),joined:peers(),left:Object.freeze([]),updated:Object.freeze([])}));});
      return ()=>peerHandlers.delete(h);
    },
    status:()=>status,
  };
  return room;
}
