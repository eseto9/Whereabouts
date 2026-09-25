/* =========================================================
   Static batching: every still thing's many little parts are
   welded into a few meshes (one per colour, plus one for its ink
   outline), so the town draws in far fewer steps. Moving parts
   are found by nudging the clock and seeing what moves.
   ========================================================= */
function batchStatic(){
  const inv=new THREE.Matrix4(),rel=new THREE.Matrix4();
  // anything a mover might touch: parts that move when the clock is nudged, and anything kept in userData
  const moving=new Set();
  const snap=new Map();
  scene.updateMatrixWorld(true);
  scene.traverse(o=>{if(o.isMesh)snap.set(o,o.matrixWorld.clone());});
  const t0=wclock();
  for(const dt of[7.3,19.1]){for(const m of W.movers){try{m(t0+dt,0.016);}catch(e){}}}
  scene.updateMatrixWorld(true);
  for(const [o,mw] of snap)if(!o.matrixWorld.equals(mw))moving.add(o);
  for(const m of W.movers){try{m(t0,0.016);}catch(e){}}
  scene.updateMatrixWorld(true);
  scene.traverse(o=>{for(const v of Object.values(o.userData||{})){
    const list=Array.isArray(v)?v:[v];for(const x of list)if(x&&x.isObject3D)x.traverse(k=>moving.add(k));}});
  let before=0,after=0;
  for(const meta of W.list){
    if(meta.mv)continue;
    const root=meta.obj;root.updateMatrixWorld(true);inv.copy(root.matrixWorld).invert();
    // welded only when the part and everything between it and the root stays put
    const buckets=new Map();
    const ok=m=>{if(!m.isMesh||m.isInstancedMesh||m.userData.isOutline||Array.isArray(m.material)||!m.visible)return false;
      if(m.material.transparent||m.material.map||m.material.side!==THREE.FrontSide)return false;
      for(let p=m;p&&p!==root;p=p.parent){if(moving.has(p))return false;if(p!==m&&!p.isMesh&&p.parent!==root&&p!==root)return false;}
      return !moving.has(root);};
    root.traverse(m=>{if(!ok(m))return;
      const key=m.material.uuid+(m.castShadow?'s':'');(buckets.get(key)||buckets.set(key,{mat:m.material,shadow:m.castShadow,parts:[]}).get(key)).parts.push(m);});
    const ink=[];
    for(const b of buckets.values()){
      if(b.parts.length<2)continue;
      const mesh=weld(b.parts,inv,rel,b.mat);if(!mesh)continue;
      mesh.castShadow=b.shadow;mesh.receiveShadow=true;mesh.userData.fid=meta.id;root.add(mesh);before+=b.parts.length;after++;
      for(const m of b.parts){for(const c of m.children)if(c.isMesh&&c.userData.isOutline)ink.push(c);}
    }
    if(ink.length){const mesh=weld(ink,inv,rel,INK);if(mesh){mesh.userData.isOutline=true;mesh.raycast=()=>{};root.add(mesh);after++;}}
    for(const b of buckets.values())if(b.parts.length>=2)for(const m of b.parts)m.parent.remove(m);
    // the welded ink replaces the old outlines (their parents are gone now)
    const outl=[];root.traverse(m=>{if(m.isMesh&&m.userData.isOutline)outl.push(m);});meta.outlines=outl;
  }
  // parts that were welded leave the click list; the welded meshes join it
  W.ray=[];for(const meta of W.list)meta.obj.traverse(m=>{if(m.isMesh&&!m.userData.isOutline&&m.userData.fid===meta.id)W.ray.push(m);});
  W.batchStats={before,after};
}
// one mesh from many parts, in the root's own space
function weld(parts,inv,rel,mat){
  const geos=[];
  for(const m of parts){m.updateMatrixWorld(true);rel.multiplyMatrices(inv,m.matrixWorld);const g=m.geometry.clone();if(!g.attributes.normal)g.computeVertexNormals();
    for(const k of Object.keys(g.attributes))if(k!=='position'&&k!=='normal')g.deleteAttribute(k);
    if(!g.index){const n=g.attributes.position.count,a=new Uint32Array(n);for(let i=0;i<n;i++)a[i]=i;g.setIndex(new THREE.BufferAttribute(a,1));}
    g.applyMatrix4(rel);
    if(rel.determinant()<0){const a=g.index.array;for(let i=0;i<a.length;i+=3){const t=a[i];a[i]=a[i+2];a[i+2]=t;}}   // mirrored parts keep their faces outward
    geos.push(g);}
  const merged=mergeGeos(geos);return merged?new THREE.Mesh(merged,mat):null;
}
function mergeGeos(geos){
  let nv=0,ni=0;for(const g of geos){nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
  if(!nv)return null;
  const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
  let vo=0,io=0;
  for(const g of geos){const p=g.attributes.position,n=g.attributes.normal;pos.set(p.array,vo*3);nor.set(n.array,vo*3);
    if(g.index){const a=g.index.array;for(let i=0;i<a.length;i++)idx[io++]=a[i]+vo;}else{for(let i=0;i<p.count;i++)idx[io++]=i+vo;}
    vo+=p.count;g.dispose();}
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(pos,3));out.setAttribute('normal',new THREE.BufferAttribute(nor,3));out.setIndex(new THREE.BufferAttribute(idx,1));
  out.computeBoundingSphere();out.computeBoundingBox();return out;
}
