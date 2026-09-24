/* =========================================================
   Hide & seek: one player disguises themselves as something
   in town while everyone else counts; then the seekers hunt.
   Each player takes a turn hiding.
   ========================================================= */
const HIDE_MS=25000,SEEK_MS=90000,HS_REVEAL_MS=5000,HS_MAX_ROUNDS=6;
// disguises that match things already standing around town
const PROPS=[
  ['barrel','Barrel','🛢️',()=>G_(at(cyl(0.5,0.5,1.2,'#9C6B3F',10),0,0.6,0),at(cyl(0.53,0.53,0.1,'#3B3F58',10,{ol:false}),0,0.3,0),at(cyl(0.53,0.53,0.1,'#3B3F58',10,{ol:false}),0,0.9,0))],
  ['crate','Crate','📦',()=>G_(at(box(1.1,1,1.1,'#C8935E'),0,0.5,0))],
  ['bin','Bin','🗑️',()=>G_(at(cyl(0.4,0.34,1,'#2E9E5B',10),0,0.5,0),at(cyl(0.45,0.45,0.1,'#2B2040',10),0,1.05,0))],
  ['hydrant','Hydrant','🧯',()=>G_(at(cyl(0.25,0.3,0.8,'#FF3B3B',10),0,0.4,0),at(sph(0.26,'#FF3B3B',10,6),0,0.82,0),rot(at(cyl(0.09,0.09,0.7,'#FF3B3B',8),0,0.55,0),0,0,Math.PI/2))],
  ['pot','Flower pot','🪴',()=>G_(at(cyl(0.45,0.35,0.6,'#C8703F',8),0,0.3,0),at(sph(0.5,'#4CB85A',7,5),0,0.9,0),at(sph(0.15,'#FF5D73',5,4,{w:0.02}),0.2,1.25,0.2))],
  ['pumpkin','Pumpkin','🎃',()=>G_(scl(at(sph(0.45,'#FF8C1A',10,6),0,0.32,0),1.2,0.8,1.2),at(cyl(0.04,0.05,0.18,'#3E9E4A',5,{ol:false}),0,0.66,0))],
  ['hay','Hay bale','🌾',()=>G_(rot(at(cyl(0.6,0.6,1.4,'#E8C45A',12),0,0.6,0),Math.PI/2,0,0))],
  ['cone','Traffic cone','🚧',()=>G_(at(cone(0.28,0.8,'#FF7A1A',10,{w:0.02}),0,0.45,0),at(box(0.6,0.06,0.6,'#FF7A1A',{w:0.015}),0,0.03,0))],
  ['rock','Rock','🪨',()=>G_(scl(at(sph(0.6,'#9B96AC',7,5),0,0.35,0),1.3,0.8,1))],
  ['bush','Bush','🌳',()=>G_(at(sph(0.6,'#3E9E4A',8,6),0,0.55,0),at(sph(0.4,'#4CB85A',7,5),0.35,0.75,0.2))],
];
const propSpec=k=>PROPS.find(p=>p[0]===k);
function makeProp(kind){const s=propSpec(kind)||PROPS[0];const g=s[3]();g.userData.prop=s[0];scene.add(g);return g;}

/* ---------- host: rounds ---------- */
function startHideSeek(){
  const ps=sortedPlayers();
  if(ps.length<2){sys('Hide & seek needs at least 2 players. Share your room code first!');return;}
  const start=Math.floor(Math.random()*ps.length);
  H.order=ps.map((p,i)=>ps[(i+start)%ps.length].peer);
  G.total=Math.min(ps.length,HS_MAX_ROUNDS);G.idx=-1;G.pts={};G.pnames={};G.score=0;G.found=0;G.finds=[];G.teams=false;G.daily='';
  for(const p of ps){G.pts[p.peer]=0;G.pnames[p.peer]=clean(p.presence.name)||'Bean';}
  H.sessEnd=Date.now()+G.total*(HIDE_MS+SEEK_MS+HS_REVEAL_MS)+60000;
  nextHideRound();
}
function nextHideRound(){
  G.idx++;
  const here=new Set(players().map(p=>p.peer));
  while(G.idx<G.total&&!here.has(H.order[G.idx%H.order.length]))G.idx++;
  if(G.idx>=G.total||here.size<2){endGame();return;}
  const hider=H.order[G.idx%H.order.length],p=players().find(x=>x.peer===hider);
  Object.assign(G,{phase:'hide',hider,hiderName:clean(p&&p.presence.name)||'Someone',reveal:null,lines:[],kind:'hide',spy:null,tp:null});G.r++;
  for(const q of players()){if(G.pts[q.peer]==null)G.pts[q.peer]=0;G.pnames[q.peer]=clean(q.presence.name)||'Bean';}
  H.hideEnd=Date.now()+HIDE_MS;commit();
}
function hideTick(now){
  const hiderHere=players().some(p=>p.peer===G.hider);
  if((G.phase==='hide'||G.phase==='seek')&&!hiderHere){hideReveal(null,'left');return true;}
  if(G.phase==='hide'&&now>=H.hideEnd){G.phase='seek';H.seekEnd=now+SEEK_MS;commit();return true;}
  if(G.phase==='seek'&&now>=H.seekEnd){hideReveal(null,'time');return true;}
  if(G.phase==='reveal'&&now>=H.revealEnd){nextHideRound();return true;}
  return false;
}
// tagger: the peer who found the hider (null when time ran out or the hider left)
function hideReveal(tagger,why){
  const now=Date.now(),left=Math.max(0,H.seekEnd-now);
  let pts,gp,by='';
  if(tagger){pts=50+Math.round(left/1000);gp=tagger;by=G.pnames[tagger]||'Someone';
    G.pts[tagger]=(G.pts[tagger]||0)+pts;G.pts[G.hider]=(G.pts[G.hider]||0)+Math.round((SEEK_MS-left)/1000);G.found++;}
  else if(why==='time'){pts=150;gp=G.hider;G.pts[G.hider]=(G.pts[G.hider]||0)+pts;}
  else{pts=0;gp='';}
  G.finds.push({c:`${G.hiderName} hid`,n:G.hiderName,by,p:pts});
  G.phase='reveal';G.reveal={hs:true,found:!!tagger,why,name:G.hiderName,by,pts,gp,coins:gp?40:0,secs:Math.round((SEEK_MS-left)/1000),bonus:[]};
  H.revealEnd=now+HS_REVEAL_MS;commit();
}
function onTag(m,d){
  if(!amHost()||!G.hs||G.phase!=='seek'||d.r!==G.r||d.peer!==G.hider||m.peer===G.hider)return;
  hideReveal(m.peer,'found');
}

/* ---------- every player ---------- */
const HS={prop:null,saved:null,lastTag:0};
const iAmHider=()=>G.hs&&G.hider===myPeer();
const hiding=()=>G.hs&&(G.phase==='hide'||G.phase==='seek');
// swap our own bean for the chosen disguise, or back
function setDisguise(kind){
  if(!P.bean)return;
  if(kind){
    if(!HS.saved)HS.saved=P.bean;else scene.remove(P.bean);
    HS.saved.visible=false;HS.prop=kind;P.bean=makeProp(kind);P.bean.position.copy(P.pos);
  }else if(HS.saved){scene.remove(P.bean);P.bean=HS.saved;P.bean.visible=true;HS.saved=null;HS.prop=null;}
  presence({prop:kind||null});renderDisguise();
}
function renderDisguise(){
  const el=$('#disguise');const show=iAmHider()&&hiding();el.hidden=!show;if(!show)return;
  const box_=$('#propBtns');if(box_.childElementCount!==PROPS.length){box_.textContent='';for(const [k,l,e] of PROPS){const b=document.createElement('button');b.className='chip';b.dataset.k=k;b.textContent=e;b.title=l;b.setAttribute('aria-label',l);b.onclick=()=>{setDisguise(k);sfx.pop();};box_.appendChild(b);}}
  for(const b of box_.children)b.setAttribute('aria-pressed',b.dataset.k===HS.prop);
}
// round changes, seen by everyone
function hideTransition(prevPhase,prevR){
  if(!G.hs)return;
  if(G.r!==prevR&&G.phase==='hide'){
    if(iAmHider()){setDisguise(pick(PROPS)[0]);toast('You’re hiding!\nPick a disguise and find a spot',2600);sfx.spy();}
    else{setDisguise(null);P.pos.set(sr(-3,3),0,sr(4.5,7));P.pos.y=groundY(P.pos.x,P.pos.z);P.yaw=Math.PI;toast(`Eyes closed!\n${G.hiderName} is hiding…`,2200);}
  }
  if(G.phase==='seek'&&prevPhase==='hide'){if(iAmHider())toast('Seekers are coming!\nStay still…',2000);else{toast(`Find ${G.hiderName}!`,1800);sfx.clue();}}
  if(G.phase==='reveal'&&prevPhase==='seek'&&G.reveal&&G.reveal.hs){
    const r=Remote.get(G.hider);const at_=iAmHider()?P.pos:r?r.bean.position:null;if(at_)burst(new V3(at_.x,at_.y+1.2,at_.z),80);
    if(G.reveal.found){sfx.chime();toast(`${G.reveal.by} found ${G.hiderName}!`,2200);}
    else if(G.reveal.why==='time'){sfx.fanfare();toast(`${G.hiderName} stayed hidden!`,2200);}
    buzz(G.reveal.gp===myPeer()?[30,40,60]:[20]);
  }
  if(!hiding()&&HS.saved)setDisguise(null);
  renderDisguise();
}
// a seeker taps something: is it the hider in disguise?
function hideClick(nx,ny){
  if(!G.hs||G.phase!=='seek'||iAmHider())return false;
  const now=Date.now();if(now-HS.lastTag<1200)return true;HS.lastTag=now;
  const r=Remote.get(G.hider);let hit=null;
  if(r&&r.bean.userData.prop){const meshes=[];r.bean.traverse(o=>{if(o.isMesh&&!o.userData.isOutline)meshes.push(o);});
    raycaster.setFromCamera({x:nx,y:ny},camera);const h=raycaster.intersectObjects(meshes,false)[0];
    if(h){const w=rayAt(nx,ny,W.ray);if(!w||w.distance>h.distance)hit=h;}}
  if(hit){emit('wb.tag',{r:G.r,peer:G.hider});sfx.tick();return true;}
  const w=rayAt(nx,ny,W.ray);if(w){const o=W.list[w.object.userData.fid];toast(`Just ${o.n.replace(/^the /,'a ')}…`,900);sfx.thud();buzz(80);}
  return true;
}
// seekers can't peek or wander while the hider hides
const frozenSeeker=()=>G.hs&&G.phase==='hide'&&!iAmHider();
