/* =========================================================
   Leaderboard: everyone's all-time points and finds.
   Inside Claude it lives in the artifact's shared db; on the
   web version each player's score is kept on the public relay
   as a "retained" message that newcomers receive straight away.
   ========================================================= */
const Leaders={me:null,db:[],web:new Map(),unsub:null,client:null,connecting:false,relay:0};
function lbMe(){
  if(Leaders.me)return Leaders.me;
  let m={};try{m=JSON.parse(localStorage.getItem('wb.lb')||'{}')||{};}catch(e){}
  if(typeof m.id!=='string'||!/^[a-z0-9]{12,24}$/.test(m.id))m.id=(Math.random().toString(36).slice(2,10)+Math.random().toString(36).slice(2,10)).slice(0,16);
  m.finds=clamp(Math.floor(+m.finds||0),0,1e5);m.pts=clamp(Math.floor(+m.pts||0),0,1e7);
  return Leaders.me=m;
}
function lbSave(){const m=Leaders.me;try{localStorage.setItem('wb.lb',JSON.stringify({id:m.id,finds:m.finds,pts:m.pts}));}catch(e){}}
// a find of yours: add it to your totals and share them
function lbRecord(pts){const m=lbMe();m.finds++;m.pts+=Math.max(0,Math.round(pts)||0);lbSave();lbPublish();}
const lbRow=(id,d)=>({id:String(id).slice(0,40),name:clean(d&&d.n)||'Bean',col:safeCol(d&&d.c),finds:clamp(Math.floor(+(d&&d.f)||0),0,1e5),pts:clamp(Math.floor(+(d&&d.p)||0),0,1e7)});
const lbPayload=()=>{const m=lbMe(),nm=$('#nameIn');return {n:clean(myName||(nm&&nm.value))||'Bean',c:myCol,f:m.finds,p:m.pts,at:Date.now()};};
function lbPublish(){
  const m=lbMe();if(!m.finds)return;
  if(Cloud.db){try{Cloud.db.doc('leaders/'+(Cloud.uid||m.id)).set(lbPayload());}catch(e){}}
  else if(!window.claude){lbConnect().then(c=>{if(c&&c.connected)c.publish(WEB_NS+'lb/'+m.id,JSON.stringify(lbPayload()),{qos:0,retain:true});});}
}
// start listening to the board (called when the Leaders tab opens)
function lbWatch(){
  if(Cloud.db){
    if(Leaders.unsub)return;
    try{Leaders.unsub=Cloud.db.collection('leaders').orderBy('p','desc').limit(25)
      .onSnapshot(q=>{Leaders.db=q.docs.map(d=>lbRow(d.id,d.data()));renderLeaders();},()=>{Leaders.unsub=null;});}catch(e){}
  }else if(!window.claude)lbConnect();
}
async function lbConnect(){
  if(Leaders.client)return Leaders.client;
  if(Leaders.connecting)return null;Leaders.connecting=true;
  try{if(!window.mqtt)await loadScript(MQTT_SRC);}catch(e){Leaders.connecting=false;return null;}
  return new Promise(res=>{
    const url=WEB_RELAYS[Leaders.relay%WEB_RELAYS.length];
    const c=window.mqtt.connect(url,{clientId:'lb'+lbMe().id,clean:true,keepalive:30,reconnectPeriod:5000,connectTimeout:8000});
    let done=false;
    c.on('connect',()=>{if(done)return;done=true;Leaders.client=c;Leaders.connecting=false;c.subscribe(WEB_NS+'lb/+',{qos:0});if(Daily.webKey)c.subscribe(WEB_NS+'daily/'+Daily.webKey+'/+',{qos:0});res(c);if(lbMe().finds)c.publish(WEB_NS+'lb/'+lbMe().id,JSON.stringify(lbPayload()),{qos:0,retain:true});});
    c.on('message',(t,buf)=>{
      let d;try{d=JSON.parse(new TextDecoder().decode(buf));}catch(e){return;}if(!d||typeof d!=='object')return;
      if(t.startsWith(WEB_NS+'daily/')){dailyWebRow(t,d);return;}
      const id=t.split('/').pop();if(!/^[a-z0-9]{12,24}$/.test(id))return;
      Leaders.web.set(id,lbRow(id,d));renderLeaders();});
    setTimeout(()=>{if(!done){done=true;try{c.end(true);}catch(e){}Leaders.connecting=false;Leaders.relay++;res(null);}},9000);
  });
}
function lbRows(){
  const rows=Cloud.db?Leaders.db.slice():[...Leaders.web.values()];
  // your own row is always up to date, even before the board echoes it back
  const m=lbMe(),myId=Cloud.db?(Cloud.uid||m.id):m.id;
  if(m.finds){const i=rows.findIndex(r=>r.id===myId),mine=lbRow(myId,lbPayload());if(i>=0)rows[i]=mine;else rows.push(mine);}
  return {rows:rows.sort((a,b)=>b.pts-a.pts||b.finds-a.finds).slice(0,25),myId};
}
function renderLeaders(){
  const el=$('#leadBoard');if(!el||$('#leadView').hidden)return;
  el.textContent='';
  const {rows,myId}=lbRows();
  const note=t=>{const li=document.createElement('li');li.className='none';li.textContent=t;el.appendChild(li);};
  if(!Cloud.db&&window.claude){note('The leaderboard works in the shared artifact.');return;}
  if(!rows.length){note(Leaders.client||Cloud.db?'Nobody’s on the board yet. Find something to be first!':'Loading the board…');return;}
  rows.forEach((r,i)=>{
    const li=document.createElement('li');if(r.id===myId)li.className='me';
    const a=document.createElement('span');a.textContent=['🥇','🥈','🥉'][i]||String(i+1);
    const b=document.createElement('span');const dot=document.createElement('i');dot.className='dot';dot.style.background=r.col;b.append(dot,document.createTextNode(r.name));
    const c=document.createElement('small');c.textContent=`${r.finds} found`;
    const d=document.createElement('b');d.textContent=r.pts;
    li.append(a,b,c,d);el.appendChild(li);
  });
}
