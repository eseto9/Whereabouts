/* =========================================================
   World registry: everything you can click is "findable"
   ========================================================= */
const W={list:[],ray:[],obstacles:[],docks:[],movers:[],pickables:[],ground:null};
function F(obj,meta){
  if(!obj.parent) scene.add(obj);
  meta.id=W.list.length; meta.obj=obj; meta.outlines=[];
  meta.p=meta.p!==false;
  obj.traverse(m=>{
    if(!m.isMesh) return;
    if(m.userData.isOutline){meta.outlines.push(m);return;}
    m.userData.fid=meta.id; W.ray.push(m);
  });
  W.list.push(meta);
  return obj;
}
const circ=(x,z,r)=>W.obstacles.push({t:0,x,z,r});
const rect=(x,z,w,d)=>W.obstacles.push({t:1,x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});

