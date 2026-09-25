/* =========================================================
   Island terrain
   ========================================================= */
const POND={x:-38,z:6,r:6};
// the countryside: a wide headland to the east where the farm and orchard spread out
const LOBE={a:0.02,w:0.62,r:48};
function shoreR(a){
  let d=a-LOBE.a;d=((d+Math.PI)%TAU+TAU)%TAU-Math.PI;
  return 62+5*Math.sin(3*a+1)+3*Math.cos(5*a)+LOBE.r*Math.exp(-((d/LOBE.w)**4));
}
function edgeDist(x,z){return shoreR(Math.atan2(z,x))-Math.hypot(x,z);}
function landH(x,z){
  let h=0.3+4.6*smooth(-18,-34,z);
  let amp=0.5*smooth(-22,-33,x)*smooth(POND.r+1,POND.r+5,Math.hypot(x-POND.x,z-POND.z));
  h+=amp*(Math.sin(x*0.35+1.3)*Math.cos(z*0.3)+0.5*Math.sin(z*0.7+x*0.2));
  const e=edgeDist(x,z);
  if(e<8) h=lerp(-2.6,h,smooth(0,8,e));
  return h;
}
function onDock(x,z){for(const d of W.docks){if(x>=d.x0&&x<=d.x1&&z>=d.z0&&z<=d.z1)return d;}return null;}
function groundY(x,z){const d=onDock(x,z);const h=landH(x,z);return d?Math.max(h,d.y):h;}
function walkable(x,z){return edgeDist(x,z)>5.8||!!onDock(x,z);}

function buildGround(){
  const g=new THREE.PlaneGeometry(215,165,172,132); g.rotateX(-Math.PI/2); g.translate(25,0,0);
  const pos=g.attributes.position;
  for(let i=0;i<pos.count;i++) pos.setY(i,landH(pos.getX(i),pos.getZ(i)));
  const ng=g.toNonIndexed(); const p=ng.attributes.position;
  const cols=new Float32Array(p.count*3);
  const C=h=>new THREE.Color(h);
  const wet=C('#E3C27C'),sand=C('#F8DE98'),dry=C('#EAD08A'),lush=C('#6FC457'),mid=C('#86D25F'),light=C('#A3E06E'),hill=C('#79C85C'),c=new THREE.Color();
  // soft rolling patches of lighter and darker grass (smooth noise, a touch of per-facet sparkle)
  const noise=(x,z)=>0.5*Math.sin(x*0.11+Math.sin(z*0.07)*2)*Math.cos(z*0.09-0.6)+0.3*Math.sin((x+z)*0.23+1.7)+0.2*Math.cos(x*0.41-z*0.37);
  for(let i=0;i<p.count;i+=3){
    const cx=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3, cz=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3;
    const e=edgeDist(cx,cz);
    if(e<6.2)c.copy(wet);
    else if(e<10.5)c.copy(sand).lerp(dry,smooth(8.5,10.5,e)*0.6);
    else{const n=noise(cx,cz)+(srand()-0.5)*0.22;
      c.copy(n<0?lush:mid).lerp(n<0?mid:light,n<0?1+n:n);
      if(cz<-22)c.lerp(hill,0.35);
      if(e<12.5)c.lerp(dry,(1-smooth(10.5,12.5,e))*0.5);}
    for(let k=0;k<3;k++){cols[(i+k)*3]=c.r;cols[(i+k)*3+1]=c.g;cols[(i+k)*3+2]=c.b;}
  }
  ng.setAttribute('color',new THREE.BufferAttribute(cols,3));
  ng.computeVertexNormals();
  const m=new THREE.Mesh(ng,new THREE.MeshToonMaterial({vertexColors:true,gradientMap:gradTex}));
  m.receiveShadow=true; scene.add(m); W.ground=m; W.pickables.push(m);
}

function dense(pts,step){
  const out=[];
  for(let i=0;i<pts.length-1;i++){
    const [ax,az]=pts[i],[bx,bz]=pts[i+1]; const L=Math.hypot(bx-ax,bz-az); const n=Math.max(1,Math.ceil(L/step));
    for(let k=0;k<n;k++) out.push([lerp(ax,bx,k/n),lerp(az,bz,k/n)]);
  }
  out.push(pts[pts.length-1]); return out;
}
function ribbon(pts,w,mat,closed,yo){
  yo=yo||0.07; const n=pts.length; const pos=[],idx=[],uv=[]; let dist=0;
  for(let i=0;i<n;i++){
    let tx,tz;
    if(!closed&&i===0){tx=pts[1][0]-pts[0][0];tz=pts[1][1]-pts[0][1];}
    else if(!closed&&i===n-1){tx=pts[i][0]-pts[i-1][0];tz=pts[i][1]-pts[i-1][1];}
    else{const a=pts[(i-1+n)%n],b=pts[(i+1)%n];tx=b[0]-a[0];tz=b[1]-a[1];}
    const l=Math.hypot(tx,tz)||1, nx=-tz/l*w/2, nz=tx/l*w/2; const [x,z]=pts[i];
    if(i>0) dist+=Math.hypot(x-pts[i-1][0],z-pts[i-1][1]);
    pos.push(x+nx,landH(x+nx,z+nz)+yo,z+nz, x-nx,landH(x-nx,z-nz)+yo,z-nz);
    uv.push(0,dist/w,1,dist/w);
  }
  const segs=closed?n:n-1;
  for(let i=0;i<segs;i++){const a=i*2,b=((i+1)%n)*2;idx.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx); g.computeVertexNormals();
  // flat layers on the ground: the higher it sits, the more it's pulled towards the camera, so overlaps never flicker
  if(!mat.polygonOffset){mat.polygonOffset=true;mat.polygonOffsetFactor=-1-yo*40;mat.polygonOffsetUnits=-2-yo*80;}
  const m=new THREE.Mesh(g,mat); m.receiveShadow=true; scene.add(m); W.pickables.push(m); return m;
}

