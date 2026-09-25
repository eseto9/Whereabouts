/* =========================================================
   Town shuffle: at the start of every game the small, portable
   things (crates, pots, balls, bikes…) are moved to new spots,
   some in a different part of town. Buildings, trees and roads
   stay put. The host picks a number (the seed) and everyone
   rearranges their town the same way from it, so all players
   see the same layout; the daily challenge uses the date.
   ========================================================= */
const Shuffle={list:[],spots:[],applied:0};
// riddles and descriptions that say where a thing is would be wrong somewhere else
const PLACE_WORDS=/\b(next to|beside|by the|near the|on top of|under the|behind the|in front of|outside|fountain|pier|dock|harbou?r|beach|market|square|park|farm|orchard|hill|pond|windmill|road|street|shop|caf[eé]|bakery|gate|corner|door|window|roof|wall|fence|stall|counter|shelf|garden|yard|field|meadow|sand)\b/i;
// things that belong where they are, however small
const NO_SHUFFLE=/sign|statue|well|grid|hopscotch|bus stop|lamp|post box|mailbox|hydrant|gate|arch|flag|bin|bench|trough|coop|hive|scarecrow|sundial|plaque|board|stand|kiosk|booth|stall|swing|slide|seesaw|sandpit|tent|campfire|mailbox|pump|tap|shower|lifebuoy|ring|bollard|hedge|patch|cabbage|corn|pig|ladder|bush|shed|drinking|marshmallow/i;
// beach things stay on the coast and farm things out in the countryside; the rest can go anywhere in town
function zoneAt(x,z){const d=districtAt(x,1,z);return d==='harbor'||edgeDist(x,z)<14?'coast':d==='farm'||d==='orchard'?'country':'town';}
function shuffleSetup(){
  const boxes=new Map();for(const o of W.list)if(!o.mv&&o.obj.parent===scene)boxes.set(o,new THREE.Box3().setFromObject(o.obj));
  for(const o of W.list){
    if(!o.p||o.mv||o.obj.parent!==scene||NO_SHUFFLE.test(o.k)||NO_SHUFFLE.test(o.n))continue;
    const p=o.obj.position,b=boxes.get(o),sz=new V3();b.getSize(sz);
    if(Math.abs(p.y-landH(p.x,p.z))>0.25||edgeDist(p.x,p.z)<8||onDock(p.x,p.z))continue;
    if(sz.y>3.2||Math.max(sz.x,sz.z)>3||Math.max(sz.x,sz.y,sz.z)<0.35)continue;
    const text=[...riddlesOf(o),o.u||'',o.v||'',o.s||''].join(' ');
    if(PLACE_WORDS.test(text))continue;
    Shuffle.list.push({o,zone:zoneAt(p.x,p.z),x0:p.x,z0:p.z,x:p.x,z:p.z,dy:p.y-landH(p.x,p.z),r:Math.max(sz.x,sz.z)/2,box:b,obs:[]});
  }
  // each one's walls: the obstacles standing inside its footprint
  const claimed=new Set();
  for(const c of Shuffle.list){const b=c.box;
    for(const ob of W.obstacles){if(claimed.has(ob))continue;const cx=ob.t===0?ob.x:(ob.x0+ob.x1)/2,cz=ob.t===0?ob.z:(ob.z0+ob.z1)/2;
      if(cx>=b.min.x-0.2&&cx<=b.max.x+0.2&&cz>=b.min.z-0.2&&cz<=b.max.z+0.2){c.obs.push(ob);claimed.add(ob);}}}
  // the spots: everywhere a shuffled thing started, plus open grass elsewhere
  const mine=new Set(Shuffle.list.map(c=>c.o)),others=[...boxes].filter(([o])=>!mine.has(o)).map(([,b])=>b);
  const saved=W.obstacles.slice();W.obstacles.length=0;for(const ob of saved)if(!claimed.has(ob))W.obstacles.push(ob);
  const roomAt=(x,z)=>{let r=0;for(const c of [0.5,0.8,1.1,1.4,1.8])if(spotClear(x,z,c))r=c;else break;return r;};
  const clearOfThings=(x,z,r)=>!others.some(b=>x>b.min.x-r&&x<b.max.x+r&&z>b.min.z-r&&z<b.max.z+r);
  for(const c of Shuffle.list)Shuffle.spots.push({x:c.x0,z:c.z0,zone:c.zone,room:Math.max(c.r+0.2,roomAt(c.x0,c.z0))});
  const rng=seededRng('whereabouts:spots'),ray=new THREE.Raycaster(),down=new V3(0,-1,0);
  const onGrass=(x,z)=>{ray.set(new V3(x,40,z),down);const h=ray.intersectObjects(W.pickables,false)[0];return h&&h.object===W.ground;};
  for(let i=0;i<600&&Shuffle.spots.length<Shuffle.list.length*2;i++){
    const x=-62+rng()*186,z=-62+rng()*124;
    if(edgeDist(x,z)<9||Math.abs(Math.hypot(x,z)-26)<4.5)continue;
    const room=roomAt(x,z);if(room<0.8||!clearOfThings(x,z,0.9))continue;
    if(Shuffle.spots.some(s=>Math.hypot(s.x-x,s.z-z)<3))continue;
    if(!onGrass(x,z))continue;
    Shuffle.spots.push({x,z,room,zone:zoneAt(x,z)});
  }
  W.obstacles.length=0;W.obstacles.push(...saved);
}
function hashSeed(str){let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h||1;}
// move one thing (and its walls) to (x,z)
function shuffleMove(c,x,z){
  const dx=x-c.x,dz=z-c.z;if(!dx&&!dz)return;
  c.o.obj.position.set(x,landH(x,z)+c.dy,z);c.x=x;c.z=z;delete c.o.area;
  for(const ob of c.obs){if(ob.t===0){ob.x+=dx;ob.z+=dz;}else{ob.x0+=dx;ob.x1+=dx;ob.z0+=dz;ob.z1+=dz;}}
}
// seed 0 puts everything back where it started
function shuffleTown(seed){
  seed=seed>>>0;if(seed===Shuffle.applied)return;Shuffle.applied=seed;
  if(!seed){for(const c of Shuffle.list)shuffleMove(c,c.x0,c.z0);}
  else{
    const rng=seededRng('whereabouts:shuffle:'+seed),placed=[],used=new Set();
    const order=Shuffle.list.slice().sort((a,b)=>b.r-a.r||a.o.id-b.o.id);
    for(const c of order){
      const fits=Shuffle.spots.filter(s=>!used.has(s)&&s.zone===c.zone&&s.room>=c.r+0.15&&placed.every(p=>Math.hypot(p.x-s.x,p.z-s.z)>p.r+c.r+0.5));
      const away=fits.filter(s=>Math.hypot(s.x-c.x0,s.z-c.z0)>4);
      const pool=away.length?away:fits;
      const s=pool.length?pool[Math.floor(rng()*pool.length)]:{x:c.x0,z:c.z0};
      used.add(s);placed.push({x:s.x,z:s.z,r:c.r});shuffleMove(c,s.x,s.z);
    }
  }
  scene.updateMatrixWorld(true);
  buildMapImage();
}
