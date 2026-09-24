/* =========================================================
   Remote Wanderbeans
   ========================================================= */
const Remote=new Map();
function updateRemotes(dt,ts){
  const seen=new Set();
  for(const p of players()){
    if(p.sameTab)continue;const pr=p.presence;if(typeof pr.x!=='number'||!Number.isFinite(pr.x))continue;
    seen.add(p.peer);
    // the hider in hide & seek shows up as their disguise, with no name tag
    const prop=G.hs&&(G.phase==='hide'||G.phase==='seek')&&p.peer===G.hider&&propSpec(pr.prop)?pr.prop:'';
    const sig=pr.col+'|'+JSON.stringify(pr.fit)+'|'+pr.name+'|'+prop;let r=Remote.get(p.peer);
    if(r&&r.sig!==sig){scene.remove(r.bean);Remote.delete(p.peer);r=null;}
    if(!r){r={bean:prop?makeProp(prop):makeBean(safeCol(pr.col),safeFit(pr.fit),clean(pr.name)||'Bean'),sig,face:+pr.ry||0};r.bean.position.set(pr.x,+pr.y||0,+pr.z||0);Remote.set(p.peer,r);}
    const b=r.bean;const k=damp(12,dt);
    b.position.x=lerp(b.position.x,pr.x,k);b.position.y=lerp(b.position.y,+pr.y||0,k);b.position.z=lerp(b.position.z,+pr.z||0,k);
    r.face=angLerp(r.face,+pr.ry||0,k);b.rotation.y=r.face;
    if(b.userData.body){animBean(b,{an:pr.an|0,em:typeof pr.em==='string'?pr.em:'',emAt:+pr.emAt||0},ts);b.userData.scope.scale.setScalar(pr.bi?1.6:1);}
  }
  for(const [k,r] of Remote){if(!seen.has(k)){scene.remove(r.bean);Remote.delete(k);}}
}

